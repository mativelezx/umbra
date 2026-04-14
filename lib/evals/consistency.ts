import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { claudeText, getModelId } from '@/lib/claude/client';
import { buildAnalyzeProfilePrompt } from '@/lib/prompts/analyze-profile';
import type { AnalyzeResponse, BigFive, JungFunctions } from '@/types';

import { EVAL_CASES, type EvalCase } from './cases';

const BIG_FIVE_KEYS: Array<keyof BigFive> = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
];

const JUNG_KEYS: Array<keyof JungFunctions> = ['Se', 'Si', 'Ne', 'Ni', 'Te', 'Ti', 'Fe', 'Fi'];

const DEFAULT_RUNS_PER_CASE = 5;
const DEFAULT_PASS_CRITERION = 2.5;
const ANALYZE_MAX_RETRIES = 3;
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

const SnapshotCaseSchema = z
  .object({
    id: z.string(),
    h1Runs: z.array(AnalyzeResponseSchema).optional(),
    h2: z.unknown().optional(),
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

export interface H1Result {
  caseId: string;
  runs: number;
  bigFiveStddev: Record<keyof BigFive, number>;
  jungStddev: Record<keyof JungFunctions, number>;
  maxStddev: number;
  pass: boolean;
}

export interface H1Report {
  model: string;
  runsPerCase: number;
  passCriterion: number;
  results: H1Result[];
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

function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
  return roundMetric(Math.sqrt(variance));
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
    `No se pudo analizar el caso tras ${ANALYZE_MAX_RETRIES} intentos. ${formatError(lastError)}`,
  );
}

function buildH1Result(caseId: string, runs: AnalyzeResponse[], passCriterion: number): H1Result {
  const bigFiveStddev = buildRecord(BIG_FIVE_KEYS, (key) =>
    standardDeviation(runs.map((run) => run.bigFive[key])),
  );

  const jungStddev = buildRecord(JUNG_KEYS, (key) =>
    standardDeviation(runs.map((run) => run.jungFunctions[key])),
  );

  const maxStddev = roundMetric(
    Math.max(...Object.values(bigFiveStddev), ...Object.values(jungStddev)),
  );

  const pass =
    Object.values(bigFiveStddev).every((value) => value < passCriterion) &&
    Object.values(jungStddev).every((value) => value < passCriterion);

  return {
    caseId,
    runs: runs.length,
    bigFiveStddev,
    jungStddev,
    maxStddev,
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

async function writeSnapshot(model: string, entries: Array<{ id: string; h1Runs: AnalyzeResponse[] }>): Promise<void> {
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
      h1Runs: entry.h1Runs,
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

export async function runH1(opts: {
  runsPerCase?: number;
  cases?: EvalCase[];
  passCriterion?: number;
}): Promise<H1Report> {
  const model = getModelId();
  const runsPerCase = opts.runsPerCase ?? DEFAULT_RUNS_PER_CASE;
  const passCriterion = opts.passCriterion ?? DEFAULT_PASS_CRITERION;
  const cases = opts.cases ?? EVAL_CASES;

  if (runsPerCase <= 0) {
    throw new Error('runsPerCase debe ser mayor que 0.');
  }

  if (shouldUseSnapshotCache()) {
    const snapshot = await readLatestSnapshot(model);

    if (!snapshot) {
      throw new Error(`No hay snapshot cacheado para el modelo ${model}.`);
    }

    const snapshotById = new Map(snapshot.cases.map((entry) => [entry.id, entry]));
    const results = cases.map((caseItem) => {
      const cached = snapshotById.get(caseItem.id);

      if (!cached?.h1Runs || cached.h1Runs.length < runsPerCase) {
        throw new Error(
          `El snapshot no tiene suficientes corridas H1 para ${caseItem.id}. Requeridas: ${runsPerCase}.`,
        );
      }

      return buildH1Result(caseItem.id, cached.h1Runs.slice(0, runsPerCase), passCriterion);
    });

    const failedCases = results.filter((result) => !result.pass).map((result) => result.caseId);

    return {
      model: snapshot.model,
      runsPerCase,
      passCriterion,
      results,
      overallPass: failedCases.length === 0,
      failedCases,
      generatedAt: snapshot.generatedAt,
    };
  }

  const snapshotEntries: Array<{ id: string; h1Runs: AnalyzeResponse[] }> = [];
  const results: H1Result[] = [];

  for (const caseItem of cases) {
    const runs: AnalyzeResponse[] = [];

    for (let index = 0; index < runsPerCase; index += 1) {
      runs.push(await analyzeCaseText(caseItem.text, model));
    }

    snapshotEntries.push({
      id: caseItem.id,
      h1Runs: runs,
    });

    results.push(buildH1Result(caseItem.id, runs, passCriterion));
  }

  await writeSnapshot(model, snapshotEntries);

  const failedCases = results.filter((result) => !result.pass).map((result) => result.caseId);

  return {
    model,
    runsPerCase,
    passCriterion,
    results,
    overallPass: failedCases.length === 0,
    failedCases,
    generatedAt: new Date().toISOString(),
  };
}
