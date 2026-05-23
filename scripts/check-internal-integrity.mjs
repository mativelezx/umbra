#!/usr/bin/env node
/* eslint-disable no-console */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const failures = [];

function readText(path) {
  return readFileSync(join(ROOT, path), 'utf8');
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

function routeFromFile(file, apiRoot) {
  const rel = file
    .slice(apiRoot.length)
    .replace(/^\/+/, '')
    .replace(/\/route\.ts$/, '');
  return `/api${rel ? `/${rel}` : ''}`;
}

function collectSupabaseTables() {
  const sql = walk('supabase/migrations', (file) => file.endsWith('.sql'))
    .map((file) => readText(file))
    .join('\n');
  const created = new Set();
  const rls = new Set();
  const createRe =
    /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:(?:"?public"?\.)?)"?([a-zA-Z_][a-zA-Z0-9_]*)"?/gi;
  const rlsRe =
    /alter\s+table\s+(?:if\s+exists\s+)?(?:(?:"?public"?\.)?)"?([a-zA-Z_][a-zA-Z0-9_]*)"?\s+enable\s+row\s+level\s+security/gi;
  for (const match of sql.matchAll(createRe)) {
    if (match[1].toUpperCase() !== 'AS') created.add(match[1]);
  }
  for (const match of sql.matchAll(rlsRe)) rls.add(match[1]);
  return { created: [...created].sort(), rls };
}

const rootPackage = readJson('package.json');
const project = rootPackage.name.replace(/^@[^/]+\//, '');

const configs = {
  younic: {
    namespace: '@younic/',
    apiRoot: 'apps/web/app/api',
    apiDocs: ['docs/tech/API_MAP.md', 'docs/generated/API_MAP.generated.md'],
    dbMode: 'supabase',
    expectedWorkspaces: ['apps/*'],
  },
  umbra: {
    namespace: 'umbra',
    apiRoot: 'app/api',
    apiDocs: ['docs/API_MAP.md'],
    dbMode: 'supabase',
    expectedWorkspaces: ['.'],
  },
  vaultia: {
    namespace: '@vaultia/',
    apiRoot: 'apps/web/src/app/api',
    apiDocs: ['docs/04-API_MAP.md'],
    dbMode: 'drizzle',
    expectedWorkspaces: ['apps/*', 'packages/*'],
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
  for (const packageDir of workspacePackages) {
    const pkg = packageDir === '.' ? rootPackage : readJson(join(packageDir, 'package.json'));
    const ok =
      packageDir === '.'
        ? pkg.name === project
        : pkg.name.startsWith(config.namespace) || pkg.name === project;
    check(ok, `${packageDir} package name is namespaced/coherent (${pkg.name})`);
  }

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
    const { created, rls } = collectSupabaseTables();
    const missingRls = created.filter((table) => !rls.has(table));
    check(created.length > 0, `Supabase migrations define tables (${created.length})`);
    check(missingRls.length === 0, 'all Supabase public tables enable RLS in migrations');
    if (missingRls.length > 0) {
      console.error(`Tables missing RLS:\n${missingRls.map((table) => `  - ${table}`).join('\n')}`);
    }
  }

  if (config.dbMode === 'drizzle') {
    const schemaText = walk('packages/db/src/schema', (file) => file.endsWith('.ts'))
      .map((file) => readText(file))
      .join('\n');
    const schemaTables = [...schemaText.matchAll(/pgTable\(\s*['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]/g)]
      .map((match) => match[1])
      .sort();
    const rlsSql = readText('packages/db/src/sql/rls-policies.sql');
    const rlsTables = new Set(
      [...rlsSql.matchAll(/['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]/g)].map((match) => match[1]),
    );
    for (const match of rlsSql.matchAll(/ALTER\s+TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+/gi)) {
      rlsTables.add(match[1]);
    }
    const globalTables = new Set(config.globalTables);
    const missingRls = schemaTables.filter((table) => !rlsTables.has(table) && !globalTables.has(table));
    const schemaDocs = ['docs/12-SCHEMA.md', 'docs/06-SECURITY.md']
      .filter((file) => existsSync(join(ROOT, file)))
      .map((file) => readText(file))
      .join('\n');
    const missingSchemaDocs = schemaTables.filter((table) => !schemaDocs.includes(table));
    check(schemaTables.length > 0, `Drizzle schema defines tables (${schemaTables.length})`);
    check(missingRls.length === 0, 'tenant tables are covered by RLS policy SQL or explicit global allowlist');
    check(missingSchemaDocs.length === 0, 'DB docs mention every Drizzle table');
    if (missingRls.length > 0) {
      console.error(`Tables missing RLS/global allowlist:\n${missingRls.map((table) => `  - ${table}`).join('\n')}`);
    }
    if (missingSchemaDocs.length > 0) {
      console.error(`Tables missing from schema docs:\n${missingSchemaDocs.map((table) => `  - ${table}`).join('\n')}`);
    }
  }
}

const git = spawnSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' });
if (git.status === 0) {
  const tracked = git.stdout.split('\n').filter(Boolean);
  const residual = tracked.filter((file) =>
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
