/**
 * Standalone runner for H2 (paraphrase robustness) preregistered hypothesis.
 *
 * Usage:
 *   npx tsx scripts/run-h2.ts
 *   npx tsx scripts/run-h2.ts --from-cache
 *   npx tsx scripts/run-h2.ts --pass=8
 *
 * Flags:
 *   --from-cache     Read committed snapshot instead of calling Claude.
 *   --pass=X         Override default max delta < 10 pass criterion.
 *
 * Output:
 *   eval-results/H2-YYYYMMDD-HHmmss.json
 *
 * H2 preregistration (docs/biz/VALIDATION.md):
 *   Given 3 semantic-preserving paraphrases produced by Claude Sonnet +
 *   Claude Haiku rewriters (intra-vendor per ADR-020), the Big Five
 *   scores for the paraphrased texts deviate < 10 points (max pairwise
 *   delta) from the original on all eval cases.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { runH2 } from '@/lib/evals/cross-model-paraphrase';

function parseArg(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg?.split('=')[1];
}

async function main() {
  const passCriterion = parseArg('pass') ? Number(parseArg('pass')) : undefined;

  // eslint-disable-next-line no-console
  console.log('[h2] starting paraphrase robustness eval');
  const started = Date.now();
  // Note: --from-cache is picked up internally by cross-model-paraphrase.ts
  const report = await runH2({ passCriterion });
  const elapsed = Date.now() - started;

  // eslint-disable-next-line no-console
  console.log(
    `[h2] done in ${(elapsed / 1000).toFixed(1)}s — overallPass=${report.overallPass} failedCases=${report.failedCases.length}/${report.results.length}`,
  );

  if (!existsSync('eval-results')) {
    await mkdir('eval-results', { recursive: true });
  }
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
  const file = `eval-results/H2-${stamp}.json`;
  await writeFile(file, JSON.stringify(report, null, 2), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[h2] wrote ${file}`);

  process.exit(report.overallPass ? 0 : 1);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('[h2] fatal error:', e);
  process.exit(2);
});
