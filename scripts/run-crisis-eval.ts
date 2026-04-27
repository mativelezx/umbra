/**
 * Standalone script to run the crisis classifier eval and write a
 * JSON report to eval-results/.
 *
 * Usage:
 *   npx tsx scripts/run-crisis-eval.ts
 *   npx tsx scripts/run-crisis-eval.ts --force-classifier
 *
 * Flags:
 *   --force-classifier   Force the Claude classifier on every case
 *                        (bypasses the regex short-circuit for 'none'
 *                        severity). Use when you want to measure what
 *                        the classifier would do independently of the
 *                        regex pre-filter.
 *
 * Output:
 *   eval-results/crisis-YYYYMMDD-HHmmss.json
 *
 * Environment:
 *   Requires ANTHROPIC_API_KEY and ANTHROPIC_MODEL_ID in .env
 *   (loaded via dotenv if present, otherwise read from process.env).
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { runCrisisEval } from '@/lib/evals/crisis-eval';

async function main() {
  const args = new Set(process.argv.slice(2));
  const forceClassifierOnSafe = args.has('--force-classifier');

  // eslint-disable-next-line no-console
  console.log('[crisis-eval] starting run');
  // eslint-disable-next-line no-console
  console.log(
    `[crisis-eval] model=${process.env.ANTHROPIC_MODEL_ID ?? 'default'} forceClassifier=${forceClassifierOnSafe}`,
  );

  const started = Date.now();
  const report = await runCrisisEval({ forceClassifierOnSafe });
  const elapsed = Date.now() - started;

  // Summary
  // eslint-disable-next-line no-console
  console.log(
    `[crisis-eval] done in ${(elapsed / 1000).toFixed(1)}s — precision=${report.precision.toFixed(3)} recall=${report.recall.toFixed(3)} f1=${report.f1.toFixed(3)}`,
  );
  // eslint-disable-next-line no-console
  console.log(
    `[crisis-eval] confusion: TP=${report.confusion.truePositives} TN=${report.confusion.trueNegatives} FP=${report.confusion.falsePositives} FN=${report.confusion.falseNegatives}`,
  );
  // eslint-disable-next-line no-console
  console.log(`[crisis-eval] overall pass: ${report.overallPass ? 'YES' : 'NO'}`);

  if (!report.passRecall) {
    // eslint-disable-next-line no-console
    console.warn(
      `[crisis-eval] RECALL FAILED: ${report.recall.toFixed(3)} < ${report.passCriterion.recall}`,
    );
  }
  if (!report.passPrecision) {
    // eslint-disable-next-line no-console
    console.warn(
      `[crisis-eval] PRECISION FAILED: ${report.precision.toFixed(3)} < ${report.passCriterion.precision}`,
    );
  }

  // Write report
  if (!existsSync('eval-results')) {
    await mkdir('eval-results', { recursive: true });
  }
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
  const file = `eval-results/crisis-${stamp}.json`;
  await writeFile(file, JSON.stringify(report, null, 2), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[crisis-eval] wrote ${file}`);

  process.exit(report.overallPass ? 0 : 1);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('[crisis-eval] fatal error:', e);
  process.exit(2);
});
