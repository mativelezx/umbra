/**
 * CI gate — verifies that every public table created in supabase/migrations
 * has (a) ENABLE ROW LEVEL SECURITY and (b) at least one CREATE POLICY.
 *
 * Rationale: RLS is the primary access-control mechanism for Umbra
 * (ADR-003). Shipping a table without a policy would expose data via
 * anon key. This test parses migration SQL and fails the CI if any
 * public table is missing either the ENABLE directive or a policy.
 *
 * Service-role-only tables (crisis_events, research_dataset,
 * delete_confirmations) are still required to ENABLE RLS — we just
 * don't require explicit policies for them, since absence of a policy
 * is the way to make a table service-role-only under Supabase RLS.
 * They're listed in SERVICE_ROLE_ONLY_TABLES below.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase/migrations');

/**
 * Tables that are intentionally service-role-only (no SELECT/INSERT/
 * UPDATE/DELETE policies for authenticated users). They MUST still
 * have ENABLE RLS. See ADR-008 (crisis_events) and ADR-013
 * (research_dataset).
 */
const SERVICE_ROLE_ONLY_TABLES = new Set([
  'crisis_events',
  'research_dataset',
  'delete_confirmations',
]);

interface MigrationFileContent {
  name: string;
  content: string;
}

function loadMigrationFiles(): MigrationFileContent[] {
  const entries = readdirSync(MIGRATIONS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.sql'))
    .map((e) => ({
      name: e.name,
      content: readFileSync(path.join(MIGRATIONS_DIR, e.name), 'utf8'),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extract `public.<table_name>` from `CREATE TABLE ... public.foo (...)`
 * or `CREATE TABLE IF NOT EXISTS public.foo (...)`. Comments are
 * stripped before parsing to avoid matching table names mentioned only
 * in `-- ...` lines.
 */
function extractCreatedTables(sqlContent: string): string[] {
  const stripped = sqlContent
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const regex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.(\w+)/gi;
  const found: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(stripped)) !== null) {
    found.push(match[1]);
  }
  return found;
}

/**
 * Check if a table name appears in an `ALTER TABLE public.X ENABLE ROW
 * LEVEL SECURITY;` statement anywhere in the combined migration content.
 */
function hasEnableRls(table: string, sql: string): boolean {
  const regex = new RegExp(
    `ALTER\\s+TABLE\\s+public\\.${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
    'i',
  );
  return regex.test(sql);
}

/**
 * Check if at least one `CREATE POLICY ... ON public.X` exists for a
 * given table.
 */
function hasPolicy(table: string, sql: string): boolean {
  const regex = new RegExp(
    `CREATE\\s+POLICY\\s+"?[^"]*"?\\s+ON\\s+public\\.${table}`,
    'i',
  );
  return regex.test(sql);
}

describe('RLS coverage (CI gate)', () => {
  const files = loadMigrationFiles();
  const allContent = files.map((f) => f.content).join('\n\n');
  const allTables = files.flatMap((f) => extractCreatedTables(f.content));
  const uniqueTables = Array.from(new Set(allTables));

  it('migrations directory is not empty', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('finds at least some created public tables', () => {
    expect(uniqueTables.length).toBeGreaterThan(0);
  });

  for (const table of ['profiles', 'psychological_profiles', 'consent_records']) {
    it(`expected foundational table "${table}" is present`, () => {
      expect(uniqueTables).toContain(table);
    });
  }

  it('every public table has ENABLE ROW LEVEL SECURITY', () => {
    const missing = uniqueTables.filter((t) => !hasEnableRls(t, allContent));
    if (missing.length > 0) {
      // eslint-disable-next-line no-console
      console.error(
        `Tables missing ENABLE RLS: ${missing.join(', ')}\n` +
          'Fix: add `ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;` to the migration.',
      );
    }
    expect(missing).toEqual([]);
  });

  it('every non-service-role-only table has at least one CREATE POLICY', () => {
    const missing = uniqueTables
      .filter((t) => !SERVICE_ROLE_ONLY_TABLES.has(t))
      .filter((t) => !hasPolicy(t, allContent));
    if (missing.length > 0) {
      // eslint-disable-next-line no-console
      console.error(
        `Tables missing CREATE POLICY: ${missing.join(', ')}\n` +
          'Fix: add `CREATE POLICY "name" ON public.<table> FOR ... USING (...);` or ' +
          'add the table to SERVICE_ROLE_ONLY_TABLES in this test if intentional.',
      );
    }
    expect(missing).toEqual([]);
  });

  it('service-role-only tables still have ENABLE RLS', () => {
    for (const table of SERVICE_ROLE_ONLY_TABLES) {
      if (uniqueTables.includes(table)) {
        expect(hasEnableRls(table, allContent)).toBe(true);
      }
    }
  });
});
