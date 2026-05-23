#!/usr/bin/env node
/* eslint-disable no-console */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const failures = [];

function readText(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

function readOptionalText(path) {
  const absolute = join(ROOT, path);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function pass(message) {
  console.log(`ok - ${message}`);
}

function check(condition, message) {
  if (condition) {
    pass(message);
  } else {
    failures.push(message);
    console.error(`fail - ${message}`);
  }
}

function walk(dir, predicate = () => true) {
  const start = join(ROOT, dir);
  if (!existsSync(start)) return [];
  const files = [];
  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current)) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.turbo' || entry === '.git') {
        continue;
      }
      const absolute = join(current, entry);
      const stat = statSync(absolute);
      if (stat.isDirectory()) {
        stack.push(absolute);
      } else if (predicate(absolute)) {
        files.push(relative(ROOT, absolute));
      }
    }
  }
  return files.sort();
}

function collectWorkspacePackages() {
  const packages = [];
  for (const workspace of rootPackage.workspaces ?? []) {
    if (workspace === '.') {
      packages.push('.');
      continue;
    }
    if (!workspace.endsWith('/*')) continue;
    const base = workspace.slice(0, -2);
    if (!existsSync(join(ROOT, base))) continue;
    for (const entry of readdirSync(join(ROOT, base))) {
      const packagePath = join(base, entry, 'package.json');
      if (existsSync(join(ROOT, packagePath))) {
        packages.push(join(base, entry));
      }
    }
  }
  return packages.sort();
}

function collectPackageManifests() {
  return ['.', ...collectWorkspacePackages().filter((packageDir) => packageDir !== '.')].map(
    (packageDir) => ({
      dir: packageDir,
      manifest: packageDir === '.' ? rootPackage : readJson(join(packageDir, 'package.json')),
    }),
  );
}

function routeFromFile(file, apiRoot) {
  const rel = file
    .slice(apiRoot.length)
    .replace(/^\/+/, '')
    .replace(/\/route\.ts$/, '');
  return `/api${rel ? `/${rel}` : ''}`;
}

function stripSqlComments(sql) {
  return sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

function normalizeVersionSpec(spec) {
  if (!spec || spec.startsWith('workspace:') || spec.startsWith('file:')) return null;
  return spec.match(/\d+\.\d+\.\d+/)?.[0] ?? null;
}

function compareVersions(left, right) {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if ((a[index] ?? 0) > (b[index] ?? 0)) return 1;
    if ((a[index] ?? 0) < (b[index] ?? 0)) return -1;
  }
  return 0;
}

function checkInternalWorkspaceDependencies(packageManifests) {
  const workspaceNames = new Set(
    packageManifests
      .map(({ dir, manifest }) => (dir === '.' ? null : manifest.name))
      .filter(Boolean),
  );
  const invalid = [];
  for (const { dir, manifest } of packageManifests) {
    for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
      for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
        if (workspaceNames.has(name) && !spec.startsWith('workspace:')) {
          invalid.push(`${dir}:${field}:${name}@${spec}`);
        }
      }
    }
  }
  check(invalid.length === 0, 'internal workspace dependencies use workspace:* protocol');
  if (invalid.length > 0) {
    console.error(`Invalid internal deps:\n${invalid.map((item) => `  - ${item}`).join('\n')}`);
  }
}

function checkMinimumDependencies(packageManifests, minimums) {
  const missingOrOld = [];
  for (const { dir, manifest } of packageManifests) {
    for (const field of ['dependencies', 'devDependencies']) {
      for (const [name, minimum] of Object.entries(minimums)) {
        const spec = manifest[field]?.[name];
        if (!spec) continue;
        const normalized = normalizeVersionSpec(spec);
        if (!normalized || compareVersions(normalized, minimum) < 0) {
          missingOrOld.push(`${dir}:${field}:${name}@${spec} < ${minimum}`);
        }
      }
    }
  }
  check(missingOrOld.length === 0, 'direct dependencies meet audited minimum versions');
  if (missingOrOld.length > 0) {
    console.error(`Outdated direct deps:\n${missingOrOld.map((item) => `  - ${item}`).join('\n')}`);
  }
}

function checkPnpmOverrides(overrideMinimums) {
  const overrides = rootPackage.pnpm?.overrides ?? {};
  const missingOrOld = overrideMinimums.filter(({ key, minimum }) => {
    const spec = overrides[key];
    const normalized = normalizeVersionSpec(spec);
    return !normalized || compareVersions(normalized, minimum) < 0;
  });
  check(missingOrOld.length === 0, 'pnpm overrides pin audited transitive dependencies');
  if (missingOrOld.length > 0) {
    console.error(
      `Missing/outdated pnpm overrides:\n${missingOrOld
        .map(({ key, minimum }) => `  - ${key} >= ${minimum}`)
        .join('\n')}`,
    );
  }
}

function collectSupabaseState() {
  const sql = stripSqlComments(
    walk('supabase/migrations', (file) => file.endsWith('.sql'))
      .map((file) => readText(file))
      .join('\n'),
  );
  const configToml = readOptionalText('supabase/config.toml');
  const created = new Set();
  const rls = new Set();
  const policies = new Set();
  const createRe =
    /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:(?:"?public"?\.)?)"?([a-zA-Z_][a-zA-Z0-9_]*)"?/gi;
  const rlsRe =
    /alter\s+table\s+(?:if\s+exists\s+)?(?:(?:"?public"?\.)?)"?([a-zA-Z_][a-zA-Z0-9_]*)"?\s+enable\s+row\s+level\s+security/gi;
  const policyRe =
    /create\s+policy\b[\s\S]*?\bon\s+(?:table\s+)?(?:(?:"?public"?\.)?)"?([a-zA-Z_][a-zA-Z0-9_]*)"?/gi;
  for (const match of sql.matchAll(createRe)) {
    if (match[1].toUpperCase() !== 'AS') created.add(match[1]);
  }
  for (const match of sql.matchAll(rlsRe)) rls.add(match[1]);
  for (const match of sql.matchAll(policyRe)) policies.add(match[1]);
  return {
    created: [...created].sort(),
    rls,
    policies,
    hasConfig: Boolean(configToml.trim()),
    hasDefaultPrivilegeHardening:
      /alter\s+default\s+privileges[\s\S]*?revoke[\s\S]*?on\s+tables[\s\S]*?from\s+(?:anon|authenticated|public)/i.test(
        sql,
      ),
  };
}

function collectSupabaseClientTables(codeRoots) {
  const fromRe =
    /\b(?:supabase|service|serviceRoleSupabase|serverSupabase|adminSupabase|client)\s*\.\s*from\(\s*['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]/g;
  const tables = new Set();
  for (const root of codeRoots) {
    for (const file of walk(root, (candidate) => /\.(ts|tsx|js|jsx)$/.test(candidate))) {
      const text = readText(file);
      for (const match of text.matchAll(fromRe)) tables.add(match[1]);
    }
  }
  return [...tables].sort();
}

function collectDrizzleMigrationTables() {
  const sql = walk('packages/db/migrations', (file) => file.endsWith('.sql'))
    .map((file) => readText(file))
    .join('\n');
  return new Set(
    [
      ...sql.matchAll(
        /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:(?:"?public"?\.)?)"?([a-zA-Z_][a-zA-Z0-9_]*)"?/gi,
      ),
    ]
      .map((match) => match[1])
      .filter((table) => table.toUpperCase() !== 'AS'),
  );
}

const rootPackage = readJson('package.json');
const project = rootPackage.name.replace(/^@[^/]+\//, '');

const configs = {
  younic: {
    namespace: '@younic/',
    apiRoot: 'apps/web/app/api',
    apiDocs: ['docs/tech/API_MAP.md', 'docs/generated/API_MAP.generated.md'],
    codeRoots: ['apps/web/app', 'apps/web/lib'],
    dbMode: 'supabase',
    expectedWorkspaces: ['apps/*'],
    minimumPackages: {
      '@supabase/ssr': '0.10.3',
      '@supabase/supabase-js': '2.106.1',
      next: '16.2.6',
      postcss: '8.5.15',
      turbo: '2.9.14',
      vitest: '4.1.7',
    },
    overrideMinimums: [
      { key: 'fast-uri', minimum: '3.1.2' },
      { key: 'postcss', minimum: '8.5.15' },
      { key: 'ws', minimum: '8.21.0' },
    ],
  },
  umbra: {
    namespace: 'umbra',
    apiRoot: 'app/api',
    apiDocs: ['docs/API_MAP.md'],
    codeRoots: ['app', 'lib'],
    dbMode: 'supabase',
    expectedWorkspaces: ['.'],
    minimumPackages: {
      '@supabase/ssr': '0.10.3',
      '@supabase/supabase-js': '2.106.1',
      esbuild: '0.25.12',
      'eslint-config-next': '15.5.18',
      next: '15.5.18',
      postcss: '8.5.15',
      turbo: '2.9.14',
      vite: '6.4.2',
      vitest: '4.1.7',
    },
    overrideMinimums: [{ key: 'postcss', minimum: '8.5.15' }],
  },
  vaultia: {
    namespace: '@vaultia/',
    apiRoot: 'apps/web/src/app/api',
    apiDocs: ['docs/04-API_MAP.md'],
    dbMode: 'drizzle',
    expectedWorkspaces: ['apps/*', 'packages/*'],
    minimumPackages: {
      '@clerk/nextjs': '7.4.1',
      '@commitlint/cli': '21.0.1',
      '@commitlint/config-conventional': '21.0.1',
      '@supabase/ssr': '0.10.3',
      '@supabase/supabase-js': '2.106.1',
      'drizzle-orm': '0.45.2',
      inngest: '3.54.2',
      next: '15.5.18',
      postcss: '8.5.15',
      syncpack: '15.3.1',
      turbo: '2.9.14',
      vite: '6.4.2',
      vitest: '4.1.7',
    },
    overrideMinimums: [
      { key: '@opentelemetry/auto-instrumentations-node', minimum: '0.76.0' },
      { key: '@opentelemetry/exporter-prometheus', minimum: '0.218.0' },
      { key: '@opentelemetry/sdk-node', minimum: '0.218.0' },
      { key: '@protobufjs/utf8', minimum: '1.1.1' },
      { key: 'fast-uri', minimum: '3.1.2' },
      { key: 'postcss', minimum: '8.5.15' },
      { key: 'protobufjs@^7.0.0', minimum: '7.5.8' },
      { key: 'protobufjs@^8.0.0', minimum: '8.4.2' },
      { key: 'uuid', minimum: '11.1.1' },
    ],
    globalTables: [
      'fuero_provincia_validity',
      'honorarios_leyes_provinciales',
      'portal_features',
      'skill_applicability',
      'tenants',
      'tribunales',
      'users',
    ],
  },
};

const config = configs[project];
check(Boolean(config), `known project profile (${project})`);

check(rootPackage.packageManager === 'pnpm@9.15.0', 'packageManager is pnpm@9.15.0');
check(existsSync(join(ROOT, 'pnpm-lock.yaml')), 'pnpm lockfile exists');
check(existsSync(join(ROOT, 'pnpm-workspace.yaml')), 'pnpm-workspace.yaml exists');
check(existsSync(join(ROOT, 'turbo.json')), 'turbo.json exists');
check(Boolean(rootPackage.devDependencies?.turbo), 'Turbo is installed at workspace root');
check(!existsSync(join(ROOT, 'package-lock.json')), 'package-lock.json absent');
check(!existsSync(join(ROOT, 'yarn.lock')), 'yarn.lock absent');

if (config) {
  const workspaceYaml = readText('pnpm-workspace.yaml');
  for (const workspace of config.expectedWorkspaces) {
    check(
      (rootPackage.workspaces ?? []).includes(workspace) && workspaceYaml.includes(workspace),
      `workspace declares ${workspace}`,
    );
  }

  const workspacePackages = collectWorkspacePackages();
  const packageManifests = collectPackageManifests();
  for (const packageDir of workspacePackages) {
    const pkg = packageDir === '.' ? rootPackage : readJson(join(packageDir, 'package.json'));
    const ok =
      packageDir === '.'
        ? pkg.name === project
        : pkg.name.startsWith(config.namespace) || pkg.name === project;
    check(ok, `${packageDir} package name is namespaced/coherent (${pkg.name})`);
  }
  checkInternalWorkspaceDependencies(packageManifests);
  checkMinimumDependencies(packageManifests, config.minimumPackages ?? {});
  checkPnpmOverrides(config.overrideMinimums ?? []);

  const apiRoutes = walk(config.apiRoot, (file) => file.endsWith('/route.ts')).map((file) =>
    routeFromFile(file, config.apiRoot),
  );
  const apiDocs = config.apiDocs
    .filter((file) => existsSync(join(ROOT, file)))
    .map((file) => readText(file))
    .join('\n');
  const missingApiDocs = apiRoutes.filter((route) => !apiDocs.includes(route));
  check(missingApiDocs.length === 0, `API docs cover ${apiRoutes.length} route files`);
  if (missingApiDocs.length > 0) {
    console.error(`Missing API docs:\n${missingApiDocs.map((route) => `  - ${route}`).join('\n')}`);
  }

  if (config.dbMode === 'supabase') {
    const { created, rls, policies, hasConfig, hasDefaultPrivilegeHardening } =
      collectSupabaseState();
    const missingRls = created.filter((table) => !rls.has(table));
    const referencedTables = collectSupabaseClientTables(config.codeRoots ?? []);
    const missingReferencedTables = referencedTables.filter((table) => !created.includes(table));
    check(hasConfig, 'Supabase config exists');
    check(created.length > 0, `Supabase migrations define tables (${created.length})`);
    check(missingRls.length === 0, 'all Supabase public tables enable RLS in migrations');
    check(policies.size > 0, 'Supabase migrations define RLS policies');
    check(hasDefaultPrivilegeHardening, 'Supabase migrations revoke default public table grants');
    check(
      missingReferencedTables.length === 0,
      `Supabase client table references resolve to migrations (${referencedTables.length})`,
    );
    if (missingRls.length > 0) {
      console.error(`Tables missing RLS:\n${missingRls.map((table) => `  - ${table}`).join('\n')}`);
    }
    if (missingReferencedTables.length > 0) {
      console.error(
        `Supabase tables referenced by code but missing from migrations:\n${missingReferencedTables
          .map((table) => `  - ${table}`)
          .join('\n')}`,
      );
    }
  }

  if (config.dbMode === 'drizzle') {
    const schemaText = walk('packages/db/src/schema', (file) => file.endsWith('.ts'))
      .map((file) => readText(file))
      .join('\n');
    const schemaTables = [...schemaText.matchAll(/pgTable\(\s*['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]/g)]
      .map((match) => match[1])
      .sort();
    const migrationTables = collectDrizzleMigrationTables();
    const rlsSql = readText('packages/db/src/sql/rls-policies.sql');
    const rlsTables = new Set(
      [...rlsSql.matchAll(/['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]/g)].map((match) => match[1]),
    );
    for (const match of rlsSql.matchAll(/ALTER\s+TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+/gi)) {
      rlsTables.add(match[1]);
    }
    const globalTables = new Set(config.globalTables);
    const missingRls = schemaTables.filter(
      (table) => !rlsTables.has(table) && !globalTables.has(table),
    );
    const schemaDocs = ['docs/12-SCHEMA.md', 'docs/06-SECURITY.md']
      .filter((file) => existsSync(join(ROOT, file)))
      .map((file) => readText(file))
      .join('\n');
    const missingSchemaDocs = schemaTables.filter((table) => !schemaDocs.includes(table));
    const missingMigrationTables = schemaTables.filter((table) => !migrationTables.has(table));
    check(schemaTables.length > 0, `Drizzle schema defines tables (${schemaTables.length})`);
    check(missingMigrationTables.length === 0, 'Drizzle migrations include every schema table');
    check(
      missingRls.length === 0,
      'tenant tables are covered by RLS policy SQL or explicit global allowlist',
    );
    check(missingSchemaDocs.length === 0, 'DB docs mention every Drizzle table');
    if (missingMigrationTables.length > 0) {
      console.error(
        `Tables missing from migrations:\n${missingMigrationTables
          .map((table) => `  - ${table}`)
          .join('\n')}`,
      );
    }
    if (missingRls.length > 0) {
      console.error(
        `Tables missing RLS/global allowlist:\n${missingRls.map((table) => `  - ${table}`).join('\n')}`,
      );
    }
    if (missingSchemaDocs.length > 0) {
      console.error(
        `Tables missing from schema docs:\n${missingSchemaDocs.map((table) => `  - ${table}`).join('\n')}`,
      );
    }
  }
}

const git = spawnSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' });
if (git.status === 0) {
  const tracked = git.stdout.split('\n').filter(Boolean);
  const residual = tracked.filter(
    (file) =>
      /(^|\/)(node_modules|\.next|\.turbo)\//.test(file) ||
      /^\.agents\//.test(file) ||
      /^\.claude\/(skills|projects)\//.test(file) ||
      /^\.DS_Store$/.test(file),
  );
  check(residual.length === 0, 'git tracks no runtime/dependency residuals');
  if (residual.length > 0) {
    console.error(`Tracked residuals:\n${residual.map((file) => `  - ${file}`).join('\n')}`);
  }
}

if (failures.length > 0) {
  console.error(`\nInternal integrity failed (${failures.length}).`);
  process.exit(1);
}

console.log('\nInternal integrity OK.');
