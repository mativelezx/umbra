import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { claudeText, getHaikuModelId, getModelId } from '@/lib/claude/client';
import { buildAnalyzeProfilePrompt } from '@/lib/prompts/analyze-profile';
import type { AnalyzeResponse, BigFive } from '@/types';

import { EVAL_CASES, type EvalCase } from './cases';

const BIG_FIVE_KEYS: Array<keyof BigFive> = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
];

const DEFAULT_PASS_CRITERION = 10;
const PARAPHRASES_PER_CASE = 3;
const ANALYZE_MAX_RETRIES = 3;
const REWRITE_MAX_RETRIES = 3;
const CACHE_DIR = path.join(process.cwd(), 'lib/evals/.cache');

const PercentageSchema = z.coerce
  .number()
  .transform((value) => clampPercentage(value))
  .refine((value) => Number.isFinite(value), 'Puntaje inválido.');

const NonEmptyTrimmedStringSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, 'Texto vacío.');

const AnalyzeResponseSchema: z.ZodType<AnalyzeResponse> = z.object({
  bigFive: z.object({
    openness: PercentageSchema,
    conscientiousness: PercentageSchema,
    extraversion: PercentageSchema,
    agreeableness: PercentageSchema,
    neuroticism: PercentageSchema,
  }),
  jungFunctions: z.object({
    Se: PercentageSchema,
    Si: PercentageSchema,
    Ne: PercentageSchema,
    Ni: PercentageSchema,
    Te: PercentageSchema,
    Ti: PercentageSchema,
    Fe: PercentageSchema,
    Fi: PercentageSchema,
  }),
  archetype: z.enum(['hero', 'sage', 'explorer', 'creator', 'caregiver', 'rebel']),
  archetypeSecondary: NonEmptyTrimmedStringSchema,
  confidence: PercentageSchema,
  reasoning: NonEmptyTrimmedStringSchema,
});

const RewriteResponseSchema = z.object({
  text: NonEmptyTrimmedStringSchema,
});

const H2ParaphraseSchema = z.object({
  rewriter: z.string(),
  text: z.string(),
  analysis: AnalyzeResponseSchema,
});

const H2SnapshotPayloadSchema = z.object({
  original: AnalyzeResponseSchema,
  paraphrases: z.array(H2ParaphraseSchema),
});

const SnapshotCaseSchema = z
  .object({
    id: z.string(),
    h1Runs: z.unknown().optional(),
    h2: H2SnapshotPayloadSchema.optional(),
  })
  .passthrough();

const SnapshotSchema = z
  .object({
    generatedAt: z.string(),
    model: z.string(),
    cases: z.array(SnapshotCaseSchema),
  })
  .passthrough();

type Snapshot = z.infer<typeof SnapshotSchema>;
type SnapshotCase = z.infer<typeof SnapshotCaseSchema>;

type RewriteMode = 'base' | 'lexical';

interface RewriterConfig {
  label: string;
  model: string;
  mode: RewriteMode;
}

export interface H2Result {
  caseId: string;
  original: AnalyzeResponse;
  paraphrases: Array<{ rewriter: string; text: string; analysis: AnalyzeResponse }>;
  maxPairwiseDelta: Record<keyof BigFive, number>;
  maxDelta: number;
  pass: boolean;
}

export interface H2Report {
  analyzerModel: string;
  rewriterModels: string[];
  paraphrasesPerCase: number;
  passCriterion: number;
  results: H2Result[];
  overallPass: boolean;
  failedCases: string[];
  generatedAt: string;
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return roundMetric(Math.min(100, Math.max(0, value)));
}

function roundMetric(value: number): number {
  return Number(value.toFixed(4));
}

function buildRecord<K extends string>(keys: readonly K[], getValue: (key: K) => number): Record<K, number> {
  return Object.fromEntries(keys.map((key) => [key, getValue(key)])) as Record<K, number>;
}

function extractJsonPayload(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Claude no devolvió un objeto JSON parseable.');
  }

  return JSON.parse(match[0]) as unknown;
}

function parseAnalyzeResponse(text: string): AnalyzeResponse {
  return AnalyzeResponseSchema.parse(extractJsonPayload(text));
}

function buildParaphrasePrompt(text: string, mode: RewriteMode): { system: string; prompt: string } {
  const system =
    'Sos un reescritor semántico riguroso. Preservás el significado del texto original con máxima fidelidad. Tu output es JSON estricto y no agregás comentarios.';

  const variationInstruction =
    mode === 'lexical'
      ? 'Reformulá de manera más profunda. Intentá cambiar alrededor del 60% del léxico y bastante la sintaxis, pero sin alterar hechos, valores, intensidad emocional ni conclusiones.'
      : 'Reescribí con variación clara de redacción, manteniendo tono, hechos, valores e intensidad emocional.';

  const prompt = [
    '## Tarea',
    'Reescribí el texto introspectivo manteniendo el significado semántico exacto.',
    '',
    '## Restricciones',
    '- No agregues datos nuevos.',
    '- No quites información relevante.',
    '- No cambies valores, emociones, nivel de certeza ni contradicciones internas.',
    '- Mantené español rioplatense natural.',
    `- ${variationInstruction}`,
    '',
    '## Formato de salida',
    'Devolvé SOLO JSON estricto:',
    '{',
    '  "text": "<texto parafraseado>"',
    '}',
    '',
    '## Texto original',
    text,
  ].join('\n');

  return { system, prompt };
}

async function analyzeCaseText(text: string, model: string): Promise<AnalyzeResponse> {
  const { system, prompt } = buildAnalyzeProfilePrompt({
    texts: [text],
    mode: 'dynamic',
  });

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= ANALYZE_MAX_RETRIES; attempt += 1) {
    try {
      const response = await claudeText({
        system,
        prompt,
        model,
        temperature: 0,
        maxTokens: 1500,
      });

      return parseAnalyzeResponse(response.text);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `No se pudo analizar el texto tras ${ANALYZE_MAX_RETRIES} intentos. ${formatError(lastError)}`,
  );
}

async function rewriteCaseText(text: string, config: RewriterConfig): Promise<string> {
  const { system, prompt } = buildParaphrasePrompt(text, config.mode);

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= REWRITE_MAX_RETRIES; attempt += 1) {
    try {
      const response = await claudeText({
        system,
        prompt,
        model: config.model,
        temperature: 0.3,
        maxTokens: 900,
      });

      const parsed = RewriteResponseSchema.parse(extractJsonPayload(response.text));
      return parsed.text;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `No se pudo generar la paráfrasis ${config.label} tras ${REWRITE_MAX_RETRIES} intentos. ${formatError(lastError)}`,
  );
}

function computeMaxPairwiseDelta(
  analyses: AnalyzeResponse[],
): Record<keyof BigFive, number> {
  return buildRecord(BIG_FIVE_KEYS, (key) => {
    let maxDelta = 0;

    for (let leftIndex = 0; leftIndex < analyses.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < analyses.length; rightIndex += 1) {
        const delta = Math.abs(
          analyses[leftIndex].bigFive[key] - analyses[rightIndex].bigFive[key],
        );
        if (delta > maxDelta) {
          maxDelta = delta;
        }
      }
    }

    return roundMetric(maxDelta);
  });
}

function buildH2Result(
  caseId: string,
  original: AnalyzeResponse,
  paraphrases: Array<{ rewriter: string; text: string; analysis: AnalyzeResponse }>,
  passCriterion: number,
): H2Result {
  const analyses = [original, ...paraphrases.map((item) => item.analysis)];
  const maxPairwiseDelta = computeMaxPairwiseDelta(analyses);
  const maxDelta = roundMetric(Math.max(...Object.values(maxPairwiseDelta)));
  const pass = Object.values(maxPairwiseDelta).every((value) => value < passCriterion);

  return {
    caseId,
    original,
    paraphrases,
    maxPairwiseDelta,
    maxDelta,
    pass,
  };
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10).replaceAll('-', '');
}

function sanitizeFilenameSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function shouldUseSnapshotCache(): boolean {
  return process.argv.includes('--from-cache');
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

async function readLatestSnapshot(model: string): Promise<Snapshot | null> {
  try {
    const entries = await fs.readdir(CACHE_DIR);
    const suffix = `-${sanitizeFilenameSegment(model)}.json`;

    const candidates = entries
      .filter((entry) => entry.startsWith('snapshot-') && entry.endsWith(suffix))
      .sort((left, right) => right.localeCompare(left));

    for (const candidate of candidates) {
      const raw = await fs.readFile(path.join(CACHE_DIR, candidate), 'utf8');
      const parsed = SnapshotSchema.parse(JSON.parse(raw) as unknown);
      if (parsed.model === model) {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    if (isErrnoException(error) && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function readExistingSnapshotForToday(model: string): Promise<Snapshot | null> {
  const filePath = path.join(
    CACHE_DIR,
    `snapshot-${todayStamp()}-${sanitizeFilenameSegment(model)}.json`,
  );

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return SnapshotSchema.parse(JSON.parse(raw) as unknown);
  } catch (error) {
    if (isErrnoException(error) && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeSnapshot(
  model: string,
  entries: Array<{
    id: string;
    h2: {
      original: AnalyzeResponse;
      paraphrases: Array<{ rewriter: string; text: string; analysis: AnalyzeResponse }>;
    };
  }>,
): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });

  const existing = await readExistingSnapshotForToday(model);
  const byId = new Map<string, SnapshotCase>();

  for (const item of existing?.cases ?? []) {
    byId.set(item.id, item);
  }

  for (const entry of entries) {
    const previous = byId.get(entry.id) ?? { id: entry.id };
    byId.set(entry.id, {
      ...previous,
      id: entry.id,
      h2: entry.h2,
    });
  }

  const snapshot: Snapshot = {
    ...(existing ?? {}),
    generatedAt: new Date().toISOString(),
    model,
    cases: Array.from(byId.values()).sort((left, right) => left.id.localeCompare(right.id)),
  };

  const filePath = path.join(
    CACHE_DIR,
    `snapshot-${todayStamp()}-${sanitizeFilenameSegment(model)}.json`,
  );

  await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido.';
}

export async function runH2(opts: {
  cases?: EvalCase[];
  passCriterion?: number;
}): Promise<H2Report> {
  const analyzerModel = getModelId();
  const sonnetModel = getModelId();
  const haikuModel = getHaikuModelId();
  const passCriterion = opts.passCriterion ?? DEFAULT_PASS_CRITERION;
  const cases = opts.cases ?? EVAL_CASES;

  const rewriters: RewriterConfig[] = [
    { label: `sonnet:${sonnetModel}`, model: sonnetModel, mode: 'base' },
    { label: `haiku:${haikuModel}`, model: haikuModel, mode: 'base' },
    { label: `sonnet-hibrida:${sonnetModel}`, model: sonnetModel, mode: 'lexical' },
  ];

  if (shouldUseSnapshotCache()) {
    const snapshot = await readLatestSnapshot(analyzerModel);

    if (!snapshot) {
      throw new Error(`No hay snapshot cacheado para el modelo ${analyzerModel}.`);
    }

    const snapshotById = new Map(snapshot.cases.map((entry) => [entry.id, entry]));
    const results = cases.map((caseItem) => {
      const cached = snapshotById.get(caseItem.id);

      if (!cached?.h2 || cached.h2.paraphrases.length < PARAPHRASES_PER_CASE) {
        throw new Error(`El snapshot no tiene datos H2 completos para ${caseItem.id}.`);
      }

      return buildH2Result(
        caseItem.id,
        cached.h2.original,
        cached.h2.paraphrases.slice(0, PARAPHRASES_PER_CASE),
        passCriterion,
      );
    });

    const failedCases = results.filter((result) => !result.pass).map((result) => result.caseId);

    return {
      analyzerModel: snapshot.model,
      rewriterModels: Array.from(new Set([sonnetModel, haikuModel])),
      paraphrasesPerCase: PARAPHRASES_PER_CASE,
      passCriterion,
      results,
      overallPass: failedCases.length === 0,
      failedCases,
      generatedAt: snapshot.generatedAt,
    };
  }

  const snapshotEntries: Array<{
    id: string;
    h2: {
      original: AnalyzeResponse;
      paraphrases: Array<{ rewriter: string; text: string; analysis: AnalyzeResponse }>;
    };
  }> = [];

  const results: H2Result[] = [];

  for (const caseItem of cases) {
    const original = await analyzeCaseText(caseItem.text, analyzerModel);

    const rewrittenTexts = await Promise.all(
      rewriters.map(async (rewriter) => ({
        rewriter: rewriter.label,
        text: await rewriteCaseText(caseItem.text, rewriter),
      })),
    );

    const analyses = await Promise.all(
      rewrittenTexts.map((item) => analyzeCaseText(item.text, analyzerModel)),
    );

    const paraphrases = rewrittenTexts.map((item, index) => ({
      rewriter: item.rewriter,
      text: item.text,
      analysis: analyses[index],
    }));

    snapshotEntries.push({
      id: caseItem.id,
      h2: {
        original,
        paraphrases,
      },
    });

    results.push(buildH2Result(caseItem.id, original, paraphrases, passCriterion));
  }

  await writeSnapshot(analyzerModel, snapshotEntries);

  const failedCases = results.filter((result) => !result.pass).map((result) => result.caseId);

  return {
    analyzerModel,
    rewriterModels: Array.from(new Set([sonnetModel, haikuModel])),
    paraphrasesPerCase: PARAPHRASES_PER_CASE,
    passCriterion,
    results,
    overallPass: failedCases.length === 0,
    failedCases,
    generatedAt: new Date().toISOString(),
  };
}
