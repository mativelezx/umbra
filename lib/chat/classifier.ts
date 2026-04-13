import { claudeText } from '@/lib/claude/client';
import { buildClassifierPrompt } from '@/lib/prompts/crisis-classifier';
import { ClassifierFailure } from '@/lib/errors';
import { z } from 'zod';

const ClassifierResponseSchema = z.object({
  is_crisis: z.boolean(),
  severity: z.enum(['none', 'low', 'med', 'high']),
  reasoning: z.string().max(500),
});

export type ClassifierResult = z.infer<typeof ClassifierResponseSchema>;

export interface ClassifyViaClaudeParams {
  message: string;
  priorAssistantTurn?: string;
}

/**
 * Run the Claude crisis classifier.
 *
 * FAIL-CLOSED: any error (timeout, malformed JSON, refusal, schema mismatch)
 * throws ClassifierFailure, which the caller handles as a treat-as-crisis
 * signal. The cost of a false positive is much lower than a false negative.
 */
export async function classifyViaClaude(
  params: ClassifyViaClaudeParams,
): Promise<ClassifierResult> {
  const { system, prompt } = buildClassifierPrompt({
    message: params.message,
    priorAssistantTurn: params.priorAssistantTurn,
  });

  let raw: string;
  try {
    const result = await claudeText({
      system,
      prompt,
      temperature: 0,
      maxTokens: 300,
    });
    raw = result.text;
  } catch (e) {
    throw new ClassifierFailure(
      `Claude call failed: ${e instanceof Error ? e.message : 'unknown'}`,
    );
  }

  // Extract JSON from the response (Claude sometimes wraps in markdown)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new ClassifierFailure('No JSON object in classifier response');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new ClassifierFailure('Malformed JSON from classifier');
  }

  const validated = ClassifierResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new ClassifierFailure('Classifier response schema mismatch');
  }

  return validated.data;
}
