import { classifyMessage, type ClassifyResult } from './crisis-lexicon';
import { classifyViaClaude, type ClassifierResult } from './classifier';
import { ClassifierFailure, CrisisDetected } from '@/lib/errors';

export interface PipelineInput {
  message: string;
  priorAssistantTurn?: string;
  /** Sampling rate 0-1. Forces classifier call on non-regex-hit messages. */
  sampleRate?: number;
}

export interface PipelineResult {
  safe: true;
  regex: ClassifyResult;
  classifier: ClassifierResult | null;
  sampled: boolean;
}

export interface PipelineUnsafeResult {
  safe: false;
  regex: ClassifyResult;
  classifier: ClassifierResult | null;
  severity: 'low' | 'med' | 'high' | 'classifier_error';
}

/**
 * Run the full crisis-detection pipeline.
 *
 * Flow:
 * 1. Regex pass (classifyMessage) with idiom pre-filter
 * 2. If regex hit OR random sampling (1% default) → Claude classifier
 * 3. If classifier says crisis OR classifier errors (fail-closed) → throw CrisisDetected
 * 4. Otherwise return { safe: true, ... }
 *
 * The caller handles CrisisDetected by blocking the chat and returning a
 * 451 response with resources.
 */
export async function runSafetyPipeline(
  input: PipelineInput,
): Promise<PipelineResult | never> {
  const regex = classifyMessage(input.message);
  const sampleRate = input.sampleRate ?? 0.01;

  const shouldRunClassifier = regex.severity !== 'none' || Math.random() < sampleRate;
  const sampled = regex.severity === 'none' && shouldRunClassifier;

  if (!shouldRunClassifier) {
    return { safe: true, regex, classifier: null, sampled: false };
  }

  // Run Claude classifier with fail-closed semantics
  let classifier: ClassifierResult;
  try {
    classifier = await classifyViaClaude({
      message: input.message,
      priorAssistantTurn: input.priorAssistantTurn,
    });
  } catch (e) {
    if (e instanceof ClassifierFailure) {
      // Fail-closed: treat as crisis
      throw new CrisisDetected('classifier_error', regex.hits);
    }
    throw e;
  }

  if (classifier.is_crisis) {
    // Max severity from regex + classifier
    const severity = maxSeverity(regex.severity, classifier.severity);
    if (severity === 'low' || severity === 'med' || severity === 'high') {
      throw new CrisisDetected(severity, regex.hits);
    }
  }

  return { safe: true, regex, classifier, sampled };
}

function maxSeverity(
  a: 'none' | 'low' | 'med' | 'high',
  b: 'none' | 'low' | 'med' | 'high',
): 'none' | 'low' | 'med' | 'high' {
  const rank = { none: 0, low: 1, med: 2, high: 3 } as const;
  return rank[a] >= rank[b] ? a : b;
}
