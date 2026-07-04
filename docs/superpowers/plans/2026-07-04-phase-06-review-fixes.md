# Phase 6 Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 10 findings from the Phase 6 CLI review plus two informational quality items, hardening `packages/create-svelocity` without changing its behavior contract.

**Architecture:** Root-cause fixes first (a spawn-error-safe `run()` fixes two crash findings at once; a shared `lib/pkg.ts` kills the duplicated package-root logic), then targeted validation hardening, then mechanical cleanup, then the missing e2e `pnpm -r build` gate. Every fix lands with a test that fails before and passes after, except purely mechanical edits which are gated by typecheck + full suite.

**Tech Stack:** TypeScript (ESM, bundled by tsdown), vitest, citty, @clack/prompts, picocolors, Node >=22, pnpm >=10.

## Global Constraints

- Node `>=22` (`MIN_NODE = 22`), pnpm `>=10` (`MIN_PNPM = 10`) — from `src/lib/versions.ts`.
- No new runtime dependencies. All deps stay in `devDependencies`; tsdown bundles everything (`noExternal: [/.*/]` in `tsdown.config.ts`), so `dist/` must remain self-contained.
- Code style: tabs, single quotes, semicolons — match existing files exactly (repo prettier config applies).
- Unit specs are colocated: `src/**/*.spec.ts`. Integration specs live in `tests/` and the e2e suite is gated behind `CLI_INTEGRATION=1`.
- All commands run from repo root: `pnpm --filter create-svelocity test`, `pnpm --filter create-svelocity check`.
- Behavior contract unchanged: `doctor` exit code semantics (non-zero only on FAIL), `create` flags (`--name`, `--app-id`, `--yes`, `--git`, `--install`), manifest schema.

## Findings → Task Map

| Finding | Severity | Task |
|---|---|---|
| F1: e2e never runs `pnpm -r build` on generated project | MEDIUM | Task 7 |
| F2: missing git binary crashes `create` mid-run | MEDIUM | Task 1 |
| F3: xcodebuild spawn error can crash `doctor` | LOW-MED | Task 1 |
| F4: target path exists as file → ENOTDIR crash (+ duplicated dir check) | LOW-MED | Task 3 |
| F5: corrupted schema file crashes doctor/info | LOW | Task 4 |
| F6: `pkgRoot`/`cliPkg` block duplicated in cli.ts + create.ts | LOW | Task 2 |
| F7: crude `includes('"convex"')`/`includes('"electron"')` dep checks duplicated | LOW | Task 5 |
| F8: ad-hoc glyphs (`x`/`v`/`!`) bypass `glyph()` helper | LOW | Task 6 |
| F9: dead devDependency `unrun` | LOW | Task 6 |
| F10: dead clause in `isInside()` (`!resolve(rel).startsWith('..')` always true) | LOW | Task 6 |
| Info A: env check matches commented-out `# PUBLIC_CONVEX_URL=` lines | INFO | Task 5 |
| Info B: template ships author's `LICENSE` into generated projects | INFO | Task 6 |

**Explicitly out of scope (decided, do not implement):**

- Overwrite-confirmation prompt for non-empty target dirs — current fail-with-actionable-message satisfies spec 6.4; adding a destructive-overwrite path reduces safety.
- `'pnpm@10.0.0'` packageManager fallback in `create.ts` — template root always carries `packageManager`, and `writeProjectManifest` schema validation backstops it. Removing the fallback adds failure paths for zero benefit.
- Checking `process.env.PUBLIC_CONVEX_URL` in doctor — env files are the golden path; a WARN-level heuristic is the design intent.

---

### Task 1: Spawn-error-safe `run()` (fixes F2 + F3)

Root cause of both crash findings: `run()` in `src/lib/proc.ts` rejects on the child process `error` event (e.g. ENOENT when the binary doesn't exist). Callers `create.ts:177` (`git init`) and `checks.ts:210` (`xcodebuild`) never catch, so the whole CLI dies with a stack trace. Fix: `run()` never rejects — a spawn error resolves as `{ code: 1, stdout: '' }`. This also lets `commandVersion()` drop its try/catch.

**Files:**
- Create: `packages/create-svelocity/src/lib/proc.spec.ts`
- Modify: `packages/create-svelocity/src/lib/proc.ts`

**Interfaces:**
- Produces: `run(cmd: string, args: string[], opts?: { cwd?: string; inherit?: boolean }): Promise<{ code: number; stdout: string }>` — same signature, but the returned promise **never rejects**. `commandVersion(cmd: string): Promise<string | null>` unchanged.
- Consumers in `create.ts` and `checks.ts` need **no changes** — their existing `code !== 0` branches now handle the missing-binary case ("git init failed - continuing", xcode WARN).

- [ ] **Step 1: Write the failing test**

Create `packages/create-svelocity/src/lib/proc.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { commandVersion, run } from './proc.js';

describe('run', () => {
	it('resolves with exit code and stdout', async () => {
		const result = await run('node', ['-e', 'console.log("hi")']);
		expect(result.code).toBe(0);
		expect(result.stdout).toBe('hi');
	});

	it('resolves (never rejects) when the command does not exist', async () => {
		const result = await run('definitely-not-a-real-command-xyz', ['--version']);
		expect(result.code).not.toBe(0);
		expect(result.stdout).toBe('');
	});
});

describe('commandVersion', () => {
	it('returns null for a missing command', async () => {
		expect(await commandVersion('definitely-not-a-real-command-xyz')).toBeNull();
	});

	it('returns a version string for node', async () => {
		expect(await commandVersion('node')).toMatch(/\d+\./);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter create-svelocity test -- src/lib/proc.spec.ts`
Expected: FAIL — `resolves (never rejects) when the command does not exist` rejects with `Error: spawn definitely-not-a-real-command-xyz ENOENT`.

- [ ] **Step 3: Write the implementation**

Replace the full contents of `packages/create-svelocity/src/lib/proc.ts`:

```ts
import { spawn } from 'node:child_process';

export function run(
	cmd: string,
	args: string[],
	opts: { cwd?: string; inherit?: boolean } = {}
): Promise<{ code: number; stdout: string }> {
	return new Promise((resolve) => {
		const child = spawn(cmd, args, {
			cwd: opts.cwd,
			stdio: opts.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
			shell: process.platform === 'win32'
		});
		let stdout = '';
		child.stdout?.on('data', (chunk: Buffer) => (stdout += chunk.toString()));
		child.on('error', () => resolve({ code: 1, stdout: '' }));
		child.on('close', (code) => resolve({ code: code ?? 1, stdout: stdout.trim() }));
	});
}

export async function commandVersion(cmd: string): Promise<string | null> {
	const { code, stdout } = await run(cmd, ['--version']);
	return code === 0 && stdout ? stdout : null;
}
```

Notes: `error` may be followed by `close`; the second `resolve` is a no-op, which is fine. `commandVersion` keeps the `stdout` truthiness check so a zero-exit empty output still returns null.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter create-svelocity test -- src/lib/proc.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck and full suite**

Run: `pnpm --filter create-svelocity check && pnpm --filter create-svelocity test`
Expected: PASS — no consumer changes needed.

- [ ] **Step 6: Commit**

```bash
git add packages/create-svelocity/src/lib/proc.ts packages/create-svelocity/src/lib/proc.spec.ts
git commit -m "fix: run() resolves on spawn error so missing binaries degrade gracefully"
```

---

### Task 2: Shared `lib/pkg.ts` for package root + CLI version (fixes F6)

`cli.ts:11-14` and `create.ts:26-30` both compute `pkgRoot` from `import.meta.url` and parse `package.json` for the version. Extract to one module. The naive `'../..'` hop breaks when the module is imported from `src/lib/` (tests) vs bundled into `dist/` — so walk up to the nearest `package.json` instead, which is correct from both locations.

**Files:**
- Create: `packages/create-svelocity/src/lib/pkg.ts`
- Create: `packages/create-svelocity/src/lib/pkg.spec.ts`
- Modify: `packages/create-svelocity/src/cli.ts`
- Modify: `packages/create-svelocity/src/create.ts`

**Interfaces:**
- Produces: `pkgRoot: string` (absolute path to the create-svelocity package directory) and `cliVersion: string` (from its `package.json`). Later tasks import nothing new from this module.

- [ ] **Step 1: Write the failing test**

Create `packages/create-svelocity/src/lib/pkg.spec.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cliVersion, pkgRoot } from './pkg.js';

describe('pkg', () => {
	it('resolves the create-svelocity package root and version', () => {
		const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as {
			name: string;
			version: string;
		};
		expect(pkg.name).toBe('create-svelocity');
		expect(cliVersion).toBe(pkg.version);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter create-svelocity test -- src/lib/pkg.spec.ts`
Expected: FAIL — `Cannot find module './pkg.js'`.

- [ ] **Step 3: Write the implementation**

Create `packages/create-svelocity/src/lib/pkg.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function findPackageRoot(from: string): string {
	let dir = dirname(from);
	while (!existsSync(join(dir, 'package.json'))) {
		const parent = dirname(dir);
		if (parent === dir) throw new Error('create-svelocity package.json not found');
		dir = parent;
	}
	return dir;
}

export const pkgRoot = findPackageRoot(fileURLToPath(import.meta.url));

export const cliVersion = (
	JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as { version: string }
).version;
```

Why walking works from both contexts: `src/lib/pkg.ts` → `src/lib` → `src` → package root (first `package.json`). Bundled `dist/create.js` → `dist` → package root. The repo-root `package.json` is never reached because the package's own is found first.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter create-svelocity test -- src/lib/pkg.spec.ts`
Expected: PASS.

- [ ] **Step 5: Refactor `cli.ts` to use it**

In `packages/create-svelocity/src/cli.ts`, delete lines 11–14:

```ts
const pkgRoot = resolve(fileURLToPath(import.meta.url), '../..');
const cliPkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as {
	version: string;
};
```

Delete the now-unused imports `readFileSync` (from `node:fs`), `join`, `resolve` (from `node:path`), and `fileURLToPath` (from `node:url`). Add:

```ts
import { cliVersion } from './lib/pkg.js';
```

Change `version: cliPkg.version` to `version: cliVersion` in the root `defineCommand` meta.

- [ ] **Step 6: Refactor `create.ts` to use it**

In `packages/create-svelocity/src/create.ts`, delete lines 26–30:

```ts
const pkgRoot = resolve(fileURLToPath(import.meta.url), '../..');
const templateDir = join(pkgRoot, 'template');
const cliPkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as {
	version: string;
};
```

Replace with:

```ts
const templateDir = join(pkgRoot, 'template');
```

Add the import:

```ts
import { cliVersion, pkgRoot } from './lib/pkg.js';
```

Remove `fileURLToPath` from the `node:url` import (now unused; delete the whole import line if nothing else uses it). Keep `readFileSync` — it is still used at line 162 for the generated project's `package.json`. Change both `meta` `version: cliPkg.version` and the `buildManifest({ cliVersion: cliPkg.version, ... })` call to use `cliVersion`:

```ts
buildManifest({
	cliVersion,
	stackVersion: rootPkg.version ?? '0.1.0',
	packageManager: rootPkg.packageManager ?? 'pnpm@10.0.0'
})
```

- [ ] **Step 7: Typecheck, full suite, and a real bundle smoke**

Run: `pnpm --filter create-svelocity check && pnpm --filter create-svelocity test`
Expected: PASS.

Run: `pnpm --filter create-svelocity build && node packages/create-svelocity/dist/cli.js --version`
Expected: prints `0.1.0` (proves the walk works from `dist/`).

- [ ] **Step 8: Commit**

```bash
git add packages/create-svelocity/src/lib/pkg.ts packages/create-svelocity/src/lib/pkg.spec.ts packages/create-svelocity/src/cli.ts packages/create-svelocity/src/create.ts
git commit -m "refactor: shared lib/pkg.ts for package root and CLI version"
```

---

### Task 3: `targetDirProblem()` — safe target validation (fixes F4)

`create.ts` calls `readdirSync` on the target path in two places (prompt validator line 89, flag path line 103). If the path exists but is a **file**, `readdirSync` throws ENOTDIR — a crash instead of an actionable message. Extract one helper that handles missing/empty-dir/non-empty-dir/file, and use it in both places (also kills the duplication).

**Files:**
- Create: `packages/create-svelocity/src/commands/create/target-dir.ts`
- Create: `packages/create-svelocity/src/commands/create/target-dir.spec.ts`
- Modify: `packages/create-svelocity/src/create.ts`

**Interfaces:**
- Produces: `targetDirProblem(path: string, label: string): string | undefined` — returns an actionable error message, or `undefined` when the target is usable (missing or empty directory). `path` is the absolute resolved path; `label` is the user-facing name for messages.

- [ ] **Step 1: Write the failing test**

Create `packages/create-svelocity/src/commands/create/target-dir.spec.ts`:

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { targetDirProblem } from './target-dir.js';

describe('targetDirProblem', () => {
	const base = mkdtempSync(join(tmpdir(), 'sv-target-'));

	it('accepts a missing path', () => {
		expect(targetDirProblem(join(base, 'nope'), 'nope')).toBeUndefined();
	});

	it('accepts an empty directory', () => {
		const dir = join(base, 'empty');
		mkdirSync(dir);
		expect(targetDirProblem(dir, 'empty')).toBeUndefined();
	});

	it('rejects a non-empty directory', () => {
		const dir = join(base, 'full');
		mkdirSync(dir);
		writeFileSync(join(dir, 'file.txt'), 'x');
		expect(targetDirProblem(dir, 'full')).toContain('not empty');
	});

	it('rejects a path that exists but is a file', () => {
		const file = join(base, 'a-file');
		writeFileSync(file, 'x');
		expect(targetDirProblem(file, 'a-file')).toContain('not a directory');
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter create-svelocity test -- src/commands/create/target-dir.spec.ts`
Expected: FAIL — `Cannot find module './target-dir.js'`.

- [ ] **Step 3: Write the implementation**

Create `packages/create-svelocity/src/commands/create/target-dir.ts`:

```ts
import { existsSync, readdirSync, statSync } from 'node:fs';

export function targetDirProblem(path: string, label: string): string | undefined {
	if (!existsSync(path)) return undefined;
	if (!statSync(path).isDirectory()) {
		return `${label} already exists and is not a directory - pick a new name or remove it.`;
	}
	if (readdirSync(path).length > 0) {
		return `directory ${label} exists and is not empty - pick a new name or empty it.`;
	}
	return undefined;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter create-svelocity test -- src/commands/create/target-dir.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Wire into `create.ts`**

Add the import:

```ts
import { targetDirProblem } from './commands/create/target-dir.js';
```

Replace the prompt validator (currently lines 83–92) so its directory branch delegates:

```ts
validate(value) {
	const raw = value ?? '';
	const result = validateNpmName(raw);
	if (!result.validForNewPackages) {
		return (result.errors ?? result.warnings ?? ['invalid name']).join(', ');
	}
	return targetDirProblem(resolve(raw), raw);
}
```

Replace the flag-path check (currently lines 102–105):

```ts
const targetDir = resolve(name);
const dirProblem = targetDirProblem(targetDir, name);
if (dirProblem) fail(dirProblem);
```

Remove `readdirSync` and `existsSync` from the `node:fs` import in `create.ts` **only if** no longer used — `existsSync` is still used for the `templateDir` check at line 70, so keep it; `readdirSync` becomes unused, drop it.

- [ ] **Step 6: Typecheck and full suite**

Run: `pnpm --filter create-svelocity check && pnpm --filter create-svelocity test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/create-svelocity/src/commands/create/target-dir.ts packages/create-svelocity/src/commands/create/target-dir.spec.ts packages/create-svelocity/src/create.ts
git commit -m "fix: actionable error when target path is a file; dedupe dir check"
```

---

### Task 4: Guard schema parse in `readManifest` (fixes F5)

`src/lib/manifest.ts:106` parses `.svelocity/manifest.schema.json` without a try/catch. A corrupted schema file crashes `doctor` and `info`. The manifest parse two lines above is already guarded — mirror that.

**Files:**
- Modify: `packages/create-svelocity/src/lib/manifest.ts`
- Modify: `packages/create-svelocity/src/lib/manifest.spec.ts`

**Interfaces:**
- `readManifest(projectRoot: string): { manifest: Manifest | null; errors: string[] }` — signature unchanged. New behavior: corrupted schema → `manifest` still returned, `errors` contains a message naming `manifest.schema.json`.

- [ ] **Step 1: Write the failing test**

Append to the `findProjectRoot / readManifest` describe block in `packages/create-svelocity/src/lib/manifest.spec.ts`:

```ts
	it('reports a corrupted schema file instead of throwing', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-badschema-'));
		mkdirSync(join(root, '.svelocity'), { recursive: true });
		writeFileSync(join(root, '.svelocity/manifest.json'), JSON.stringify(valid));
		writeFileSync(join(root, '.svelocity/manifest.schema.json'), '{ not json');
		const { manifest, errors } = readManifest(root);
		expect(manifest).not.toBeNull();
		expect(errors.some((e) => e.includes('manifest.schema.json'))).toBe(true);
	});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter create-svelocity test -- src/lib/manifest.spec.ts`
Expected: FAIL — `SyntaxError` thrown from `readManifest`.

- [ ] **Step 3: Write the implementation**

In `packages/create-svelocity/src/lib/manifest.ts`, replace the last three lines of `readManifest` (currently lines 104–107):

```ts
	const schemaPath = join(projectRoot, '.svelocity/manifest.schema.json');
	if (!existsSync(schemaPath)) return { manifest, errors: [] };
	let schema: unknown;
	try {
		schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
	} catch (error) {
		return { manifest, errors: [`could not read ${schemaPath}: ${String(error)}`] };
	}
	return { manifest, errors: validateAgainstSchema(manifest, schema) };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter create-svelocity test -- src/lib/manifest.spec.ts`
Expected: PASS (all tests including the new one).

- [ ] **Step 5: Commit**

```bash
git add packages/create-svelocity/src/lib/manifest.ts packages/create-svelocity/src/lib/manifest.spec.ts
git commit -m "fix: readManifest reports corrupted schema instead of throwing"
```

---

### Task 5: `pkgHasDep()` + strict env-var check in doctor (fixes F7 + Info A)

Two quality problems in `src/commands/doctor/checks.ts`:
1. Dependency detection is a raw-text substring (`includes('"convex"')` at line 108, `includes('"electron"')` at line 165) — duplicated, and a `"convex"` **script** key false-positives it. Replace with one helper that actually parses `dependencies`/`devDependencies`.
2. The `PUBLIC_CONVEX_URL` check (`includes('PUBLIC_CONVEX_URL')` at line 123) passes on a commented-out `# PUBLIC_CONVEX_URL=` line. Use a line-anchored regex requiring an assignment with a value.

**Files:**
- Modify: `packages/create-svelocity/src/commands/doctor/checks.ts`
- Modify: `packages/create-svelocity/src/commands/doctor/checks.spec.ts`

**Interfaces:**
- Produces (module-private, not exported): `pkgHasDep(pkgPath: string, dep: string): boolean` — true when `dep` is a key of `dependencies` or `devDependencies`; false on missing file or unparsable JSON.
- Exported check functions keep their exact signatures and result shapes.

- [ ] **Step 1: Write the failing tests**

Append inside the `checkConvex` describe block in `packages/create-svelocity/src/commands/doctor/checks.spec.ts`:

```ts
	it('warns when PUBLIC_CONVEX_URL is only a commented-out line', () => {
		const root = makeProject();
		writeFileSync(join(root, 'apps/web/.env.local'), '# PUBLIC_CONVEX_URL=\n');
		expect(checkConvex(root).find((r) => r.name === 'PUBLIC_CONVEX_URL')?.status).toBe('warn');
	});

	it('does not treat a "convex" script as the cli dependency', () => {
		const root = makeProject();
		writeFileSync(
			join(root, 'packages/backend/package.json'),
			'{"scripts":{"convex":"convex dev"},"dependencies":{}}'
		);
		expect(checkConvex(root).find((r) => r.name === 'convex cli dependency')?.status).toBe(
			'warn'
		);
	});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter create-svelocity test -- src/commands/doctor/checks.spec.ts`
Expected: both new tests FAIL — current substring checks return `pass` for both cases.

- [ ] **Step 3: Write the implementation**

In `packages/create-svelocity/src/commands/doctor/checks.ts`, add below the `result` helper (after line 22):

```ts
function pkgHasDep(pkgPath: string, dep: string): boolean {
	if (!existsSync(pkgPath)) return false;
	try {
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
		};
		return Boolean(pkg.dependencies?.[dep] ?? pkg.devDependencies?.[dep]);
	} catch {
		return false;
	}
}
```

In `checkConvex`, replace lines 106–108:

```ts
	const backendPkg = join(root, 'packages/backend/package.json');
	const hasConvexCli = pkgHasDep(backendPkg, 'convex');
```

Still in `checkConvex`, replace the env detection (lines 120–124):

```ts
	const envFiles = ['apps/web/.env.local', 'apps/web/.env', '.env.local', '.env'];
	const setsConvexUrl = /^\s*PUBLIC_CONVEX_URL\s*=\s*\S/m;
	const hasUrl = envFiles.some(
		(f) => existsSync(join(root, f)) && setsConvexUrl.test(readFileSync(join(root, f), 'utf8'))
	);
```

In `checkTargets`, replace lines 164–165:

```ts
		const pkgPath = join(root, 'apps/desktop/package.json');
		const hasElectron = pkgHasDep(pkgPath, 'electron');
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter create-svelocity test -- src/commands/doctor/checks.spec.ts`
Expected: PASS — new tests and all pre-existing ones (existing fixtures use real `dependencies`/`devDependencies` JSON and an uncommented `PUBLIC_CONVEX_URL=...` line, so they stay green).

- [ ] **Step 5: Typecheck and commit**

Run: `pnpm --filter create-svelocity check && pnpm --filter create-svelocity test`
Expected: PASS.

```bash
git add packages/create-svelocity/src/commands/doctor/checks.ts packages/create-svelocity/src/commands/doctor/checks.spec.ts
git commit -m "fix: doctor parses package.json deps and requires uncommented PUBLIC_CONVEX_URL"
```

---

### Task 6: Mechanical cleanup — glyphs, dead dep, dead clause, LICENSE (fixes F8, F9, F10, Info B)

Four small mechanical edits, gated by typecheck + full suite instead of new unit tests (three are cosmetic/dead-code; the LICENSE change gets a build-template test assertion).

**Files:**
- Modify: `packages/create-svelocity/src/create.ts`
- Modify: `packages/create-svelocity/package.json`
- Modify: `packages/create-svelocity/scripts/build-template.mjs`
- Modify: `packages/create-svelocity/tests/build-template.spec.ts`
- Modify: `pnpm-lock.yaml` (regenerated)

**Interfaces:** none new.

- [ ] **Step 1: Unify glyphs in `create.ts` (F8)**

Change the `output.js` import to include `glyph`:

```ts
import { colors, glyph } from './lib/output.js';
```

Replace `fail()` (lines 32–35):

```ts
function fail(message: string): never {
	console.error(`${glyph('fail')} ${message}`);
	process.exit(1);
}
```

Replace the three ad-hoc glyph lines in the git block (lines 184, 187, 191):

```ts
					console.log(`${glyph('pass')} git repository initialized`);
```

```ts
					console.log(`${glyph('warn')} git init succeeded; initial commit failed - continuing`);
```

```ts
				console.log(`${glyph('warn')} git init failed - continuing without git`);
```

- [ ] **Step 2: Remove dead `unrun` dependency (F9)**

In `packages/create-svelocity/package.json`, delete the line:

```json
		"unrun": "0.3.1",
```

Then run: `pnpm install` (from repo root) to sync `pnpm-lock.yaml`.
Expected: lockfile updates, no other package affected.

- [ ] **Step 3: Fix dead clause in `isInside` and exclude LICENSE (F10 + Info B)**

In `packages/create-svelocity/scripts/build-template.mjs`, add `isAbsolute` to the `node:path` import:

```js
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
```

Replace `isInside` (lines 86–89) — `resolve(rel)` returns an absolute path, so `!resolve(rel).startsWith('..')` was always true; the intent is the Windows cross-drive case where `relative()` returns an absolute path:

```js
function isInside(parent, child) {
	const rel = relative(parent, child);
	return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}
```

Add `'LICENSE'` to `EXCLUDE_PATHS` (the set starting at line 44) — generated projects should carry their owner's license, not the stack author's:

```js
	'LICENSE',
```

- [ ] **Step 4: Assert LICENSE exclusion in the build-template test**

In `packages/create-svelocity/tests/build-template.spec.ts`, add `'LICENSE'` to the array in the `excludes heavy and stack-only paths` test (the list starting at line 20):

```ts
				'LICENSE',
```

- [ ] **Step 5: Run everything**

Run: `pnpm --filter create-svelocity check && pnpm --filter create-svelocity test`
Expected: PASS, including the updated build-template exclusion test.

- [ ] **Step 6: Commit**

```bash
git add packages/create-svelocity/src/create.ts packages/create-svelocity/package.json packages/create-svelocity/scripts/build-template.mjs packages/create-svelocity/tests/build-template.spec.ts pnpm-lock.yaml
git commit -m "chore: unify glyphs, drop unused unrun dep, fix isInside, exclude LICENSE from template"
```

---

### Task 7: e2e `pnpm -r build` on the generated project (fixes F1)

The Phase 6 exit criterion is `pnpm install && pnpm -r check && pnpm -r build` in the generated project, but the gated e2e only runs `check`; `ci.yml` builds the **repo**, not the generated (tokenized) output. Add the build step to the e2e suite and give the CI job headroom.

**Files:**
- Modify: `packages/create-svelocity/tests/integration.spec.ts`
- Modify: `.github/workflows/cli.yml`

**Interfaces:** none new.

- [ ] **Step 1: Add the build test**

In `packages/create-svelocity/tests/integration.spec.ts`, after the `passes pnpm -r check` test (line 40), add:

```ts
	it('passes pnpm -r build', () => {
		execFileSync('pnpm', ['-r', 'build'], { cwd: project, stdio: 'inherit' });
	}, 900_000);
```

- [ ] **Step 2: Bump CI timeout**

In `.github/workflows/cli.yml`, change `timeout-minutes: 30` to `timeout-minutes: 40` (install + check + build of the generated monorepo needs the headroom; repo `ci.yml` shows the build itself is ubuntu-safe).

- [ ] **Step 3: Verify locally (gated e2e — slow, ~10-20 min)**

Run: `CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts`
Expected: PASS — 4 tests including the new build step. This also re-exercises Tasks 1–6 end to end (create → doctor in a real generated project).

- [ ] **Step 4: Commit**

```bash
git add packages/create-svelocity/tests/integration.spec.ts .github/workflows/cli.yml
git commit -m "test: e2e builds the generated project, closing the phase 6 build gate"
```

Note: after this task the Phase 6 annotations "build covered by e2e/CI" (docs/phases/phase-06-thin-cli.md:12 and :139) become factually true — no doc edit required.

---

## Final Verification

- [ ] `pnpm --filter create-svelocity check` — clean
- [ ] `pnpm --filter create-svelocity test` — all unit + build-template suites pass
- [ ] `CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts` — e2e incl. build passes (if not already run in Task 7)
- [ ] `pnpm --filter create-svelocity build && node packages/create-svelocity/dist/cli.js doctor` from repo root — runs, exits per FAIL semantics, glyphs consistent
