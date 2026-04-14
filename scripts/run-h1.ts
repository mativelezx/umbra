/**
 * Standalone runner for H1 (determinism) preregistered hypothesis.
 *
 * Usage:
 *   npx tsx scripts/run-h1.ts
 *   npx tsx scripts/run-h1.ts --runs=3
 *   npx tsx scripts/run-h1.ts --from-cache
 *
 * Flags:
 *   --runs=N         Override default 5 runs per case.
 *   --from-cache     Read the committed snapshot instead of calling Claude.
 *   --pass=X         Override default stddev<2.5 pass criterion.
 *
 * Output:
 *   eval-results/H1-YYYYMMDD-HHmmss.json
 *
 * H1 preregistration (docs/biz/VALIDATION.md):
 *   Given temperature=0 and pinned model SKU, analyzing the same input
 *   produces Big Five scores with stddev<2.5 across 5 consecutive runs
 *   on all eval cases.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { runH1 } from '@/lib/evals/consistency';
import { EVAL_CASES } from '@/lib/evals/cases';

function parseArg(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg?.split('=')[1];
}

async function main() {
  const runsPerCase = parseArg('runs') ? Number(parseArg('runs')) : undefined;
  const passCriterion = parseArg('pass') ? Number(parseArg('pass')) : undefined;
  const caseLimit = parseArg('cases') ? Number(parseArg('cases')) : undefined;

  // eslint-disable-next-line no-console
  console.log('[h1] starting determinism eval');
  if (caseLimit) {
    // eslint-disable-next-line no-console
    console.log(`[h1] limiting corpus to first ${caseLimit} cases`);
  }
  const started = Date.now();
  // Note: --from-cache is picked up by consistency.ts internally via
  // process.argv inspection (shouldUseSnapshotCache helper).
  const cases = caseLimit ? EVAL_CASES.slice(0, caseLimit) : undefined;
  const report = await runH1({ runsPerCase, passCriterion, cases });
  const elapsed = Date.now() - started;

  // eslint-disable-next-line no-console
  console.log(
    `[h1] done in ${(elapsed / 1000).toFixed(1)}s — overallPass=${report.overallPass} failedCases=${report.failedCases.length}/${report.results.length}`,
  );

  if (!existsSync('eval-results')) {
    await mkdir('eval-results', { recursive: true });
  }
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
  const file = `eval-results/H1-${stamp}.json`;
  await writeFile(file, JSON.stringify(report, null, 2), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[h1] wrote ${file}`);

  process.exit(report.overallPass ? 0 : 1);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('[h1] fatal error:', e);
  process.exit(2);
});
