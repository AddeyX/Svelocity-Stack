# Phase 6 — Thin CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `create-svelocity` package: a scaffolder bin (`create-svelocity`) and a project-tooling bin (`svelocity` with `doctor` + `info`), sourcing its template from a build-time snapshot of this repo.

**Architecture:** One publishable package at `packages/create-svelocity` with two citty-based bins. `scripts/build-template.mjs` snapshots the repo root into `template/` (gitignored) with an exclude list, dotfile renames, and targeted token substitution. `create` copies + de-tokenizes the template, writes a schema-valid `.svelocity/manifest.json`, then optionally runs git init and pnpm install. `doctor`/`info` locate a project root by walking up to `.svelocity/manifest.json` and run static checks only.

**Tech Stack:** TypeScript (strict, ESM), citty (args), @clack/prompts (interactive UI), picocolors, validate-npm-package-name, tsdown (bundler), vitest (tests).

**Spec:** `docs/superpowers/specs/2026-07-04-phase-06-thin-cli-design.md` — read it before starting.

## Global Constraints

- Node >= 22, pnpm >= 10 (root `engines`); the CLI enforces the same minimums at runtime.
- Indentation: **tabs** (repo Prettier config). All new files must pass `pnpm lint`.
- ESM only (`"type": "module"` everywhere). No CommonJS.
- All CLI runtime deps are **bundled by tsdown** (`noExternal`) — the published package has zero `dependencies`. Do NOT add CLI deps to the pnpm catalog (the catalog is for stack pins that ship in generated projects; the CLI package is excluded from the template).
- Add new deps with plain `pnpm --filter create-svelocity add -D <pkg>` (resolve latest; do not hand-pin versions from memory).
- `"private": true` stays on the package until Phase 10 (release). `pnpm dlx ./packages/create-svelocity` works regardless.
- Tokens are exactly: `{{PROJECT_NAME}}`, `{{DISPLAY_NAME}}`, `{{APP_ID}}`. Token source literals in this repo: root package name `svelocity-stack`, display name `Shared Tasks`, app id `dev.svelocity.tasks` (only in `apps/mobile/capacitor.config.ts` and `apps/desktop/electron-builder.json` — native dirs are excluded from the template).
- `apps/mobile/ios` and `apps/mobile/android` are NEVER shipped in the template; generated projects run `pnpm --filter mobile exec cap add ios android`.
- Commit after every task. Commit messages follow repo style (`feat:`, `fix:`, `test:`, `docs:`).

## File Structure (end state)

```
packages/create-svelocity/
├── package.json              # bins: create-svelocity, svelocity; files: dist, template
├── tsconfig.json             # extends @svelocity/config/tsconfig/node
├── tsdown.config.ts
├── vitest.config.ts
├── .gitignore                # ignores template/ and dist/
├── assets/
│   └── README.template.md    # becomes generated project's README
├── scripts/
│   └── build-template.mjs    # repo root → template/ snapshot
├── src/
│   ├── create.ts             # bin: create-svelocity
│   ├── cli.ts                # bin: svelocity (doctor, info)
│   ├── commands/
│   │   ├── create/
│   │   │   ├── scaffold.ts       # copy + detokenize + dotfile restore
│   │   │   ├── scaffold.spec.ts
│   │   │   ├── manifest.ts       # build manifest object for new project
│   │   │   ├── manifest.spec.ts
│   │   │   ├── next-steps.ts     # printed footer text
│   │   │   └── next-steps.spec.ts
│   │   ├── doctor/
│   │   │   ├── checks.ts         # all check functions
│   │   │   ├── checks.spec.ts
│   │   │   └── run.ts            # runner + report + exit code
│   │   └── info/
│   │       ├── info.ts
│   │       └── info.spec.ts
│   └── lib/
│       ├── tokens.ts             # replaceTokens, toDisplayName, toAppId, isValidAppId
│       ├── tokens.spec.ts
│       ├── manifest.ts           # schema validation, findProjectRoot, readManifest
│       ├── manifest.spec.ts
│       ├── versions.ts           # parseMajor, satisfiesMin
│       ├── versions.spec.ts
│       ├── proc.ts               # run() child-process helper
│       └── output.ts             # status glyphs/colors
└── tests/
    ├── build-template.spec.ts    # runs the snapshot script into a temp dir
    └── integration.spec.ts       # gated by CLI_INTEGRATION=1
```

Root changes: `.github/workflows/` gains a CLI job (Task 12); `docs/phases/phase-06-thin-cli.md` checkboxes ticked (Task 13).

---

### Task 1: Package scaffold

**Files:**
- Create: `packages/create-svelocity/package.json`
- Create: `packages/create-svelocity/tsconfig.json`
- Create: `packages/create-svelocity/vitest.config.ts`
- Create: `packages/create-svelocity/.gitignore`
- Create: `packages/create-svelocity/src/lib/output.ts`

**Interfaces:**
- Produces: package `create-svelocity` in the workspace with `check`/`test` scripts; `output.ts` exports `glyph(status)` and re-exports `picocolors` as `colors` for all later tasks.

- [ ] **Step 1: Create package.json**

`packages/create-svelocity/package.json`:

```json
{
	"name": "create-svelocity",
	"version": "0.1.0",
	"private": true,
	"description": "Scaffold a Svelocity Stack project — web, desktop, and mobile from one shared core.",
	"license": "MIT",
	"type": "module",
	"bin": {
		"create-svelocity": "./dist/create.js",
		"svelocity": "./dist/cli.js"
	},
	"files": ["dist", "template"],
	"engines": {
		"node": ">=22"
	},
	"scripts": {
		"build:template": "node scripts/build-template.mjs",
		"build": "pnpm build:template && tsdown",
		"check": "tsc -p tsconfig.json",
		"test": "vitest run",
		"prepublishOnly": "pnpm build"
	},
	"devDependencies": {
		"@svelocity/config": "workspace:*",
		"typescript": "catalog:",
		"vitest": "catalog:",
		"@types/node": "catalog:"
	}
}
```

Note: `private: true` until Phase 10. `typescript`/`vitest`/`@types/node` come from the catalog (dev-only, never published); runtime deps are added in Step 3 and bundled.

- [ ] **Step 2: Create tsconfig, vitest config, .gitignore**

`packages/create-svelocity/tsconfig.json`:

```json
{
	"extends": "@svelocity/config/tsconfig/node",
	"compilerOptions": {
		"noEmit": true,
		"types": ["node"]
	},
	"include": ["src/**/*.ts", "tests/**/*.ts", "tsdown.config.ts", "vitest.config.ts"]
}
```

(If `@svelocity/config/tsconfig/node` sets options that conflict — read `packages/config/tsconfig/node.json` first and mirror how `packages/env/tsconfig.json` extends it.)

`packages/create-svelocity/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/*.spec.ts', 'tests/**/*.spec.ts']
	}
});
```

`packages/create-svelocity/.gitignore`:

```
dist/
template/
```

- [ ] **Step 3: Add runtime deps (bundled at build; devDependencies)**

```bash
pnpm --filter create-svelocity add -D citty @clack/prompts picocolors validate-npm-package-name @types/validate-npm-package-name tsdown
```

Expected: resolves latest versions, lockfile updated, no peer warnings that block install.

- [ ] **Step 4: Create output helper**

`packages/create-svelocity/src/lib/output.ts`:

```ts
import colors from 'picocolors';

export { colors };

export type CheckStatus = 'pass' | 'warn' | 'fail';

export function glyph(status: CheckStatus): string {
	if (status === 'pass') return colors.green('✓');
	if (status === 'warn') return colors.yellow('▲');
	return colors.red('✗');
}
```

- [ ] **Step 5: Verify check + empty test run**

```bash
pnpm --filter create-svelocity check
pnpm --filter create-svelocity exec vitest run --passWithNoTests
pnpm lint
```

Expected: all pass (no spec files yet, hence `--passWithNoTests`; later tasks drop it).

- [ ] **Step 6: Commit**

```bash
git add packages/create-svelocity pnpm-lock.yaml
git commit -m "feat: scaffold create-svelocity package"
```

---

### Task 2: Token utilities (`lib/tokens.ts`)

**Files:**
- Create: `packages/create-svelocity/src/lib/tokens.ts`
- Test: `packages/create-svelocity/src/lib/tokens.spec.ts`

**Interfaces:**
- Produces:
  - `interface TokenMap { PROJECT_NAME: string; DISPLAY_NAME: string; APP_ID: string }`
  - `replaceTokens(content: string, tokens: TokenMap): string` — replaces every `{{KEY}}` occurrence
  - `toDisplayName(name: string): string` — `my-cool-app` → `My Cool App`
  - `toAppId(name: string): string` — `my-cool-app` → `com.example.mycoolapp`
  - `isValidAppId(id: string): boolean` — reverse-DNS, >= 2 segments

- [ ] **Step 1: Write failing tests**

`packages/create-svelocity/src/lib/tokens.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { isValidAppId, replaceTokens, toAppId, toDisplayName } from './tokens.js';

const tokens = { PROJECT_NAME: 'my-app', DISPLAY_NAME: 'My App', APP_ID: 'com.acme.myapp' };

describe('replaceTokens', () => {
	it('replaces all occurrences of every token', () => {
		const input = '{{PROJECT_NAME}} / {{DISPLAY_NAME}} / {{APP_ID}} / {{PROJECT_NAME}}';
		expect(replaceTokens(input, tokens)).toBe('my-app / My App / com.acme.myapp / my-app');
	});

	it('leaves unknown braces untouched', () => {
		expect(replaceTokens('{{NOT_A_TOKEN}}', tokens)).toBe('{{NOT_A_TOKEN}}');
	});
});

describe('derivations', () => {
	it('derives display name from kebab-case', () => {
		expect(toDisplayName('my-cool-app')).toBe('My Cool App');
	});

	it('derives a default app id', () => {
		expect(toAppId('my-cool-app')).toBe('com.example.mycoolapp');
	});

	it('validates reverse-DNS app ids', () => {
		expect(isValidAppId('dev.svelocity.tasks')).toBe(true);
		expect(isValidAppId('com.acme')).toBe(true);
		expect(isValidAppId('nodots')).toBe(false);
		expect(isValidAppId('com..acme')).toBe(false);
		expect(isValidAppId('com.9acme')).toBe(false);
	});
});
```

- [ ] **Step 2: Run tests, verify failure**

```bash
pnpm --filter create-svelocity exec vitest run src/lib/tokens.spec.ts
```

Expected: FAIL — cannot resolve `./tokens.js`.

- [ ] **Step 3: Implement**

`packages/create-svelocity/src/lib/tokens.ts`:

```ts
export interface TokenMap {
	PROJECT_NAME: string;
	DISPLAY_NAME: string;
	APP_ID: string;
}

export function replaceTokens(content: string, tokens: TokenMap): string {
	let out = content;
	for (const [key, value] of Object.entries(tokens)) {
		out = out.replaceAll(`{{${key}}}`, value);
	}
	return out;
}

export function toDisplayName(name: string): string {
	return name
		.split(/[-_]+/)
		.filter(Boolean)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(' ');
}

export function toAppId(name: string): string {
	return `com.example.${name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
}

export function isValidAppId(id: string): boolean {
	return /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/.test(id);
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
pnpm --filter create-svelocity exec vitest run src/lib/tokens.spec.ts
```

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/create-svelocity/src/lib/tokens.ts packages/create-svelocity/src/lib/tokens.spec.ts
git commit -m "feat: token replacement and name derivation utilities"
```

---

### Task 3: Manifest library (`lib/manifest.ts`)

**Files:**
- Create: `packages/create-svelocity/src/lib/manifest.ts`
- Test: `packages/create-svelocity/src/lib/manifest.spec.ts`

**Interfaces:**
- Consumes: JSON-schema-subset validator logic ported from `scripts/validate-manifest.mjs` (repo root) — same subset: type, required, properties, additionalProperties, enum, pattern, items, minItems, uniqueItems.
- Produces:
  - `interface Manifest { stackVersion: string; createdWith: string; targets: string[]; ui: string; auth: string; backend: string; packageManager: string; aiTargets: string[]; skills: string[] }`
  - `validateAgainstSchema(value: unknown, schema: unknown): string[]` — returns error strings, empty = valid
  - `findProjectRoot(startDir: string): string | null` — walks up looking for `.svelocity/manifest.json`
  - `readManifest(projectRoot: string): { manifest: Manifest | null; errors: string[] }` — parses and, when `.svelocity/manifest.schema.json` exists, validates

- [ ] **Step 1: Write failing tests**

`packages/create-svelocity/src/lib/manifest.spec.ts`:

```ts
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findProjectRoot, readManifest, validateAgainstSchema } from './manifest.js';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../../..');
const schema = JSON.parse(readFileSync(join(repoRoot, '.svelocity/manifest.schema.json'), 'utf8'));

const valid = {
	stackVersion: '0.1.0',
	createdWith: 'create-svelocity@0.1.0',
	targets: ['web', 'desktop', 'mobile'],
	ui: 'bits-ui',
	auth: 'convex-auth',
	backend: 'convex',
	packageManager: 'pnpm@10.33.2',
	aiTargets: [],
	skills: []
};

describe('validateAgainstSchema', () => {
	it('accepts a valid manifest', () => {
		expect(validateAgainstSchema(valid, schema)).toEqual([]);
	});

	it('rejects missing required and unknown properties', () => {
		const errors = validateAgainstSchema({ ...valid, ui: undefined, bogus: 1 }, schema);
		expect(errors.some((e) => e.includes('ui'))).toBe(true);
		expect(errors.some((e) => e.includes('bogus'))).toBe(true);
	});

	it('rejects bad enum and pattern values', () => {
		const errors = validateAgainstSchema(
			{ ...valid, targets: ['web', 'vr'], packageManager: 'npm@10.0.0' },
			schema
		);
		expect(errors.length).toBeGreaterThanOrEqual(2);
	});
});

describe('findProjectRoot / readManifest', () => {
	it('walks up to the manifest and reads it', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-manifest-'));
		mkdirSync(join(root, '.svelocity'), { recursive: true });
		mkdirSync(join(root, 'apps/web'), { recursive: true });
		writeFileSync(join(root, '.svelocity/manifest.json'), JSON.stringify(valid));
		writeFileSync(join(root, '.svelocity/manifest.schema.json'), JSON.stringify(schema));

		expect(findProjectRoot(join(root, 'apps/web'))).toBe(root);
		const { manifest, errors } = readManifest(root);
		expect(errors).toEqual([]);
		expect(manifest?.stackVersion).toBe('0.1.0');
	});

	it('returns null when no manifest exists upward', () => {
		const dir = mkdtempSync(join(tmpdir(), 'sv-nomanifest-'));
		expect(findProjectRoot(dir)).toBeNull();
	});

	it('reports schema violations from readManifest', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-badmanifest-'));
		mkdirSync(join(root, '.svelocity'), { recursive: true });
		writeFileSync(join(root, '.svelocity/manifest.json'), JSON.stringify({ ...valid, ui: 'mui' }));
		writeFileSync(join(root, '.svelocity/manifest.schema.json'), JSON.stringify(schema));
		const { errors } = readManifest(root);
		expect(errors.length).toBeGreaterThan(0);
	});
});
```

- [ ] **Step 2: Run tests, verify failure**

```bash
pnpm --filter create-svelocity exec vitest run src/lib/manifest.spec.ts
```

Expected: FAIL — cannot resolve `./manifest.js`.

- [ ] **Step 3: Implement**

`packages/create-svelocity/src/lib/manifest.ts` — port the validator from `scripts/validate-manifest.mjs` verbatim (same traversal, error message format `path: message`), typed:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface Manifest {
	stackVersion: string;
	createdWith: string;
	targets: string[];
	ui: string;
	auth: string;
	backend: string;
	packageManager: string;
	aiTargets: string[];
	skills: string[];
}

interface SchemaNode {
	type?: string;
	enum?: unknown[];
	required?: string[];
	properties?: Record<string, SchemaNode>;
	additionalProperties?: boolean;
	items?: SchemaNode;
	minItems?: number;
	uniqueItems?: boolean;
	pattern?: string;
}

function validate(value: unknown, node: SchemaNode, path: string, errors: string[]): void {
	if (node.enum && !node.enum.includes(value)) {
		errors.push(`${path}: expected one of [${node.enum.join(', ')}], got ${JSON.stringify(value)}`);
		return;
	}
	if (node.type === 'object') {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			errors.push(`${path}: expected object`);
			return;
		}
		const obj = value as Record<string, unknown>;
		for (const key of node.required ?? []) {
			if (!(key in obj) || obj[key] === undefined) {
				errors.push(`${path}.${key}: required property missing`);
			}
		}
		for (const [key, child] of Object.entries(obj)) {
			if (child === undefined) continue;
			const childSchema = node.properties?.[key];
			if (!childSchema) {
				if (node.additionalProperties === false && key !== '$schema') {
					errors.push(`${path}.${key}: unknown property`);
				}
				continue;
			}
			validate(child, childSchema, `${path}.${key}`, errors);
		}
	} else if (node.type === 'array') {
		if (!Array.isArray(value)) {
			errors.push(`${path}: expected array`);
			return;
		}
		if (node.minItems !== undefined && value.length < node.minItems) {
			errors.push(`${path}: expected at least ${node.minItems} item(s)`);
		}
		if (node.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) {
			errors.push(`${path}: items must be unique`);
		}
		if (node.items) {
			value.forEach((item, i) => validate(item, node.items as SchemaNode, `${path}[${i}]`, errors));
		}
	} else if (node.type === 'string') {
		if (typeof value !== 'string') {
			errors.push(`${path}: expected string`);
			return;
		}
		if (node.pattern && !new RegExp(node.pattern).test(value)) {
			errors.push(`${path}: ${JSON.stringify(value)} does not match ${node.pattern}`);
		}
	}
}

export function validateAgainstSchema(value: unknown, schema: unknown): string[] {
	const errors: string[] = [];
	validate(value, schema as SchemaNode, 'manifest', errors);
	return errors;
}

export function findProjectRoot(startDir: string): string | null {
	let dir = startDir;
	for (;;) {
		if (existsSync(join(dir, '.svelocity/manifest.json'))) return dir;
		const parent = dirname(dir);
		if (parent === dir) return null;
		dir = parent;
	}
}

export function readManifest(projectRoot: string): { manifest: Manifest | null; errors: string[] } {
	const manifestPath = join(projectRoot, '.svelocity/manifest.json');
	let manifest: Manifest;
	try {
		manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
	} catch (error) {
		return { manifest: null, errors: [`could not read ${manifestPath}: ${String(error)}`] };
	}
	const schemaPath = join(projectRoot, '.svelocity/manifest.schema.json');
	if (!existsSync(schemaPath)) return { manifest, errors: [] };
	const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as unknown;
	return { manifest, errors: validateAgainstSchema(manifest, schema) };
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
pnpm --filter create-svelocity exec vitest run src/lib/manifest.spec.ts
```

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/create-svelocity/src/lib/manifest.ts packages/create-svelocity/src/lib/manifest.spec.ts
git commit -m "feat: manifest validation and project-root discovery"
```

---

### Task 4: Version helpers (`lib/versions.ts`) and process helper (`lib/proc.ts`)

**Files:**
- Create: `packages/create-svelocity/src/lib/versions.ts`
- Create: `packages/create-svelocity/src/lib/proc.ts`
- Test: `packages/create-svelocity/src/lib/versions.spec.ts`

**Interfaces:**
- Produces:
  - `MIN_NODE = 22`, `MIN_PNPM = 10` (constants)
  - `parseMajor(version: string): number | null` — handles `v22.1.0`, `10.12.0`, garbage → null
  - `satisfiesMin(version: string, minMajor: number): boolean`
  - `run(cmd: string, args: string[], opts?: { cwd?: string; inherit?: boolean }): Promise<{ code: number; stdout: string }>` — spawn wrapper; `inherit: true` streams stdio (for pnpm install / git)
  - `commandVersion(cmd: string): Promise<string | null>` — runs `<cmd> --version`, null if not found

- [ ] **Step 1: Write failing tests**

`packages/create-svelocity/src/lib/versions.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseMajor, satisfiesMin } from './versions.js';

describe('parseMajor', () => {
	it('parses plain and v-prefixed versions', () => {
		expect(parseMajor('22.1.0')).toBe(22);
		expect(parseMajor('v22.1.0')).toBe(22);
		expect(parseMajor('10.12.3')).toBe(10);
	});

	it('returns null for garbage', () => {
		expect(parseMajor('not-a-version')).toBeNull();
		expect(parseMajor('')).toBeNull();
	});
});

describe('satisfiesMin', () => {
	it('compares major versions', () => {
		expect(satisfiesMin('22.0.0', 22)).toBe(true);
		expect(satisfiesMin('23.1.0', 22)).toBe(true);
		expect(satisfiesMin('20.19.0', 22)).toBe(false);
		expect(satisfiesMin('garbage', 22)).toBe(false);
	});
});
```

- [ ] **Step 2: Run tests, verify failure**

```bash
pnpm --filter create-svelocity exec vitest run src/lib/versions.spec.ts
```

Expected: FAIL — cannot resolve `./versions.js`.

- [ ] **Step 3: Implement both files**

`packages/create-svelocity/src/lib/versions.ts`:

```ts
export const MIN_NODE = 22;
export const MIN_PNPM = 10;

export function parseMajor(version: string): number | null {
	const match = /^v?(\d+)\./.exec(version.trim());
	return match ? Number(match[1]) : null;
}

export function satisfiesMin(version: string, minMajor: number): boolean {
	const major = parseMajor(version);
	return major !== null && major >= minMajor;
}
```

`packages/create-svelocity/src/lib/proc.ts`:

```ts
import { spawn } from 'node:child_process';

export function run(
	cmd: string,
	args: string[],
	opts: { cwd?: string; inherit?: boolean } = {}
): Promise<{ code: number; stdout: string }> {
	return new Promise((resolve, reject) => {
		const child = spawn(cmd, args, {
			cwd: opts.cwd,
			stdio: opts.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
			shell: process.platform === 'win32'
		});
		let stdout = '';
		child.stdout?.on('data', (chunk: Buffer) => (stdout += chunk.toString()));
		child.on('error', reject);
		child.on('close', (code) => resolve({ code: code ?? 1, stdout: stdout.trim() }));
	});
}

export async function commandVersion(cmd: string): Promise<string | null> {
	try {
		const { code, stdout } = await run(cmd, ['--version']);
		return code === 0 ? stdout : null;
	} catch {
		return null;
	}
}
```

- [ ] **Step 4: Run tests + typecheck, verify pass**

```bash
pnpm --filter create-svelocity exec vitest run src/lib/versions.spec.ts
pnpm --filter create-svelocity check
```

Expected: PASS (4 tests), check clean.

- [ ] **Step 5: Commit**

```bash
git add packages/create-svelocity/src/lib/versions.ts packages/create-svelocity/src/lib/versions.spec.ts packages/create-svelocity/src/lib/proc.ts
git commit -m "feat: version parsing and child-process helpers"
```

---

### Task 5: Template snapshot script (`scripts/build-template.mjs`)

**Files:**
- Create: `packages/create-svelocity/assets/README.template.md`
- Create: `packages/create-svelocity/scripts/build-template.mjs`
- Test: `packages/create-svelocity/tests/build-template.spec.ts`

**Interfaces:**
- Produces: running `node scripts/build-template.mjs` (cwd anywhere) writes a full template into `packages/create-svelocity/template/`, or into `$TEMPLATE_OUT` when set (used by tests). Later tasks assume: `_gitignore`/`_npmrc` renames done, tokens present in root `package.json`, `README.md`, `apps/mobile/capacitor.config.ts`, `apps/desktop/electron-builder.json`; `pnpm-lock.yaml` present; no `node_modules`, `.git`, `apps/mobile/ios`, `apps/mobile/android`, `packages/create-svelocity`, `.github`.

- [ ] **Step 1: Write the generated-project README asset**

`packages/create-svelocity/assets/README.template.md`:

```markdown
# {{DISPLAY_NAME}}

Built with the [Svelocity Stack](https://github.com/manny4u67/Svelocity-Stack) — SvelteKit web, Electron desktop, and Capacitor mobile apps sharing one core, backed by Convex.

## Getting started

\`\`\`bash
pnpm install

# 1. Set up the Convex backend (creates your deployment, fills env):
pnpm --filter @svelocity/backend dev

# 2. Point the web app at it:
cp apps/web/.env.example apps/web/.env.local   # then set PUBLIC_CONVEX_URL

# 3. Run the apps:
pnpm dev            # web (SvelteKit)
pnpm dev:desktop    # desktop (Electron)
pnpm dev:mobile     # mobile web shell (Capacitor)
\`\`\`

## Mobile native projects

Native iOS/Android folders are not committed by the scaffolder. Generate them once:

\`\`\`bash
pnpm --filter mobile exec cap add ios
pnpm --filter mobile exec cap add android
pnpm --filter mobile sync
\`\`\`

## Health check

\`\`\`bash
pnpm dlx create-svelocity svelocity doctor   # or `svelocity doctor` if installed
\`\`\`

## Layout

- `apps/` — web, desktop, mobile shells
- `packages/` — shared theme, ui, app-core, auth, env, config, backend (Convex)
- `docs/` — conventions, compatibility matrix, ADRs
- `.svelocity/manifest.json` — what the CLI generated (read by `svelocity doctor` / `info`)
\`\`\`
```

(Remove the backslashes before the backticks when writing the real file — they are escapes for this plan document only. The file ends after the `.svelocity/manifest.json` bullet; drop the trailing fence artifact.)

- [ ] **Step 2: Write failing test**

`packages/create-svelocity/tests/build-template.spec.ts`:

```ts
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const pkgRoot = resolve(fileURLToPath(import.meta.url), '../..');
const out = mkdtempSync(join(tmpdir(), 'sv-template-'));

beforeAll(() => {
	execFileSync('node', [join(pkgRoot, 'scripts/build-template.mjs')], {
		env: { ...process.env, TEMPLATE_OUT: out },
		stdio: 'pipe'
	});
}, 120_000);

describe('build-template', () => {
	it('excludes heavy and stack-only paths', () => {
		for (const p of [
			'node_modules',
			'.git',
			'.github',
			'packages/create-svelocity',
			'apps/mobile/ios',
			'apps/mobile/android',
			'apps/web/node_modules',
			'docs/phases',
			'docs/superpowers',
			'docs/V1-SCOPE.md',
			'.svelocity/manifest.json',
			'apps/desktop/release',
			'apps/web/.wrangler'
		]) {
			expect(existsSync(join(out, p)), `${p} should be excluded`).toBe(false);
		}
	});

	it('includes lockfile, workspace config, backend, schema', () => {
		for (const p of [
			'pnpm-lock.yaml',
			'pnpm-workspace.yaml',
			'packages/backend/convex/_generated',
			'.svelocity/manifest.schema.json',
			'.svelocity/manifest.example.json',
			'apps/web/.env.example',
			'docs/CONVENTIONS.md',
			'docs/COMPATIBILITY.md'
		]) {
			expect(existsSync(join(out, p)), `${p} should be included`).toBe(true);
		}
	});

	it('renames dotfiles npm would strip', () => {
		expect(existsSync(join(out, '_gitignore'))).toBe(true);
		expect(existsSync(join(out, '.gitignore'))).toBe(false);
		expect(existsSync(join(out, '_npmrc'))).toBe(true);
	});

	it('tokenizes the right files', () => {
		expect(readFileSync(join(out, 'package.json'), 'utf8')).toContain('"{{PROJECT_NAME}}"');
		expect(readFileSync(join(out, 'README.md'), 'utf8')).toContain('{{DISPLAY_NAME}}');
		const cap = readFileSync(join(out, 'apps/mobile/capacitor.config.ts'), 'utf8');
		expect(cap).toContain('{{APP_ID}}');
		expect(cap).toContain('{{DISPLAY_NAME}}');
		const eb = readFileSync(join(out, 'apps/desktop/electron-builder.json'), 'utf8');
		expect(eb).toContain('{{APP_ID}}');
		expect(eb).toContain('{{DISPLAY_NAME}}');
	});

	it('leaves @svelocity/* package names untouched', () => {
		const ui = readFileSync(join(out, 'packages/ui/package.json'), 'utf8');
		expect(ui).toContain('"@svelocity/ui"');
	});
});
```

- [ ] **Step 3: Run test, verify failure**

```bash
pnpm --filter create-svelocity exec vitest run tests/build-template.spec.ts
```

Expected: FAIL — script does not exist.

- [ ] **Step 4: Implement the snapshot script**

`packages/create-svelocity/scripts/build-template.mjs`:

```js
#!/usr/bin/env node
/**
 * Snapshot the repo root into packages/create-svelocity/template/.
 * The reference monorepo IS the template; this script excludes stack-only
 * files, renames dotfiles npm strips, and injects {{TOKENS}}.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(pkgRoot, '../..');
const out = process.env.TEMPLATE_OUT ?? join(pkgRoot, 'template');

// Directory names excluded wherever they appear.
const EXCLUDE_DIR_NAMES = new Set([
	'node_modules',
	'.git',
	'.svelte-kit',
	'.wrangler',
	'dist',
	'dist-electron',
	'release',
	'build',
	'coverage',
	'.claude',
	'.DS_Store'
]);

// Repo-relative paths excluded exactly.
const EXCLUDE_PATHS = new Set([
	'packages/create-svelocity',
	'.github',
	'.svelocity/manifest.json',
	'apps/mobile/ios',
	'apps/mobile/android',
	'docs/phases',
	'docs/superpowers',
	'docs/V1-SCOPE.md',
	'docs/V1.1-BACKLOG.md',
	'docs/RISKS.md',
	'docs/Svelocity-Stack-PR.md',
	'README.md' // replaced by assets/README.template.md
]);

function excluded(rel, name) {
	if (EXCLUDE_DIR_NAMES.has(name)) return true;
	if (EXCLUDE_PATHS.has(rel.split(sep).join('/'))) return true;
	// Never ship real env files; .env.example is allowed.
	if (/^\.env(\..*)?$/.test(name) && name !== '.env.example') return true;
	return false;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(repoRoot, out, {
	recursive: true,
	filter(src) {
		const rel = relative(repoRoot, src);
		if (rel === '') return true;
		const name = rel.split(sep).at(-1);
		return !excluded(rel, name);
	}
});

// Dotfiles npm strips from published packages — rename at ANY depth, scaffold restores.
import { readdirSync, statSync } from 'node:fs'; // move to the top import block in the real file
const DOTFILE_RENAMES = new Map([
	['.gitignore', '_gitignore'],
	['.npmrc', '_npmrc']
]);
function renameDotfiles(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			renameDotfiles(full);
		} else if (DOTFILE_RENAMES.has(entry)) {
			renameSync(full, join(dir, DOTFILE_RENAMES.get(entry)));
		}
	}
}
renameDotfiles(out);

// Targeted tokenization: template-relative path → [search, replaceWithToken] pairs.
const TOKENIZE = [
	['package.json', [['"name": "svelocity-stack"', '"name": "{{PROJECT_NAME}}"']]],
	[
		'apps/mobile/capacitor.config.ts',
		[
			['dev.svelocity.tasks', '{{APP_ID}}'],
			['Shared Tasks', '{{DISPLAY_NAME}}']
		]
	],
	[
		'apps/desktop/electron-builder.json',
		[
			['dev.svelocity.tasks', '{{APP_ID}}'],
			['Shared Tasks', '{{DISPLAY_NAME}}']
		]
	]
];
for (const [rel, pairs] of TOKENIZE) {
	const file = join(out, rel);
	let content = readFileSync(file, 'utf8');
	for (const [search, replace] of pairs) {
		if (!content.includes(search)) {
			console.error(`✗ tokenize: ${rel} no longer contains ${JSON.stringify(search)}`);
			process.exit(1);
		}
		content = content.replaceAll(search, replace);
	}
	writeFileSync(file, content);
}

// Generated-project README replaces the stack README.
cpSync(join(pkgRoot, 'assets/README.template.md'), join(out, 'README.md'));

console.log(`✓ template written to ${out}`);
```

- [ ] **Step 5: Run test, verify pass**

```bash
pnpm --filter create-svelocity exec vitest run tests/build-template.spec.ts
```

Expected: PASS (5 tests). If an exclude assertion fails, fix the exclude lists — do not weaken the test.

- [ ] **Step 6: Commit**

```bash
git add packages/create-svelocity/assets packages/create-svelocity/scripts packages/create-svelocity/tests/build-template.spec.ts
git commit -m "feat: build-template snapshot script with excludes and tokenization"
```

---

### Task 6: Scaffold engine (`commands/create/scaffold.ts`)

**Files:**
- Create: `packages/create-svelocity/src/commands/create/scaffold.ts`
- Test: `packages/create-svelocity/src/commands/create/scaffold.spec.ts`

**Interfaces:**
- Consumes: `TokenMap`, `replaceTokens` from `../../lib/tokens.js`.
- Produces: `scaffold(templateDir: string, targetDir: string, tokens: TokenMap): void` — recursive copy; restores `_gitignore` → `.gitignore` and `_npmrc` → `.npmrc` (root level); token-replaces file contents for text extensions.

- [ ] **Step 1: Write failing tests**

`packages/create-svelocity/src/commands/create/scaffold.spec.ts`:

```ts
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scaffold } from './scaffold.js';

const tokens = { PROJECT_NAME: 'acme-app', DISPLAY_NAME: 'Acme App', APP_ID: 'com.acme.app' };

function makeTemplate(): string {
	const dir = mkdtempSync(join(tmpdir(), 'sv-tpl-'));
	writeFileSync(join(dir, 'package.json'), '{ "name": "{{PROJECT_NAME}}" }');
	writeFileSync(join(dir, '_gitignore'), 'node_modules\n');
	writeFileSync(join(dir, '_npmrc'), 'public-hoist-pattern[]=*\n');
	mkdirSync(join(dir, 'apps/mobile'), { recursive: true });
	writeFileSync(join(dir, 'apps/mobile/capacitor.config.ts'), "appId: '{{APP_ID}}', appName: '{{DISPLAY_NAME}}'");
	writeFileSync(join(dir, 'apps/mobile/icon.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
	return dir;
}

describe('scaffold', () => {
	it('copies, detokenizes, and restores dotfiles', () => {
		const template = makeTemplate();
		const target = join(mkdtempSync(join(tmpdir(), 'sv-target-')), 'acme-app');
		scaffold(template, target, tokens);

		expect(readFileSync(join(target, 'package.json'), 'utf8')).toContain('"acme-app"');
		expect(readFileSync(join(target, 'apps/mobile/capacitor.config.ts'), 'utf8')).toBe(
			"appId: 'com.acme.app', appName: 'Acme App'"
		);
		expect(existsSync(join(target, '.gitignore'))).toBe(true);
		expect(existsSync(join(target, '_gitignore'))).toBe(false);
		expect(existsSync(join(target, '.npmrc'))).toBe(true);
	});

	it('does not mangle binary files', () => {
		const template = makeTemplate();
		const target = join(mkdtempSync(join(tmpdir(), 'sv-target-')), 'acme-app');
		scaffold(template, target, tokens);
		expect(readFileSync(join(target, 'apps/mobile/icon.png'))).toEqual(
			Buffer.from([0x89, 0x50, 0x4e, 0x47])
		);
	});
});
```

- [ ] **Step 2: Run tests, verify failure**

```bash
pnpm --filter create-svelocity exec vitest run src/commands/create/scaffold.spec.ts
```

Expected: FAIL — cannot resolve `./scaffold.js`.

- [ ] **Step 3: Implement**

`packages/create-svelocity/src/commands/create/scaffold.ts`:

```ts
import { cpSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { replaceTokens, type TokenMap } from '../../lib/tokens.js';

const TEXT_EXTENSIONS = new Set([
	'.ts', '.js', '.mjs', '.cjs', '.svelte', '.json', '.jsonc', '.md', '.html',
	'.css', '.yaml', '.yml', '.xml', '.txt', '.example', '.gradle', '.java', '.plist'
]);

const DOTFILE_RESTORES = new Map([
	['_gitignore', '.gitignore'],
	['_npmrc', '.npmrc']
]);

export function scaffold(templateDir: string, targetDir: string, tokens: TokenMap): void {
	cpSync(templateDir, targetDir, { recursive: true });
	walk(targetDir, tokens);
}

// Single pass: restore renamed dotfiles at any depth + detokenize text files.
function walk(dir: string, tokens: TokenMap): void {
	for (const entry of readdirSync(dir)) {
		let full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			walk(full, tokens);
			continue;
		}
		const restored = DOTFILE_RESTORES.get(entry);
		if (restored) {
			const dest = join(dir, restored);
			renameSync(full, dest);
			full = dest;
		}
		const name = restored ?? entry;
		if (!TEXT_EXTENSIONS.has(extname(name)) && !name.startsWith('.')) continue;
		const content = readFileSync(full, 'utf8');
		if (!content.includes('{{')) continue;
		writeFileSync(full, replaceTokens(content, tokens));
	}
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
pnpm --filter create-svelocity exec vitest run src/commands/create/scaffold.spec.ts
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/create-svelocity/src/commands/create/scaffold.ts packages/create-svelocity/src/commands/create/scaffold.spec.ts
git commit -m "feat: scaffold engine — copy, detokenize, restore dotfiles"
```

---

### Task 7: Manifest generation + next-steps text

**Files:**
- Create: `packages/create-svelocity/src/commands/create/manifest.ts`
- Create: `packages/create-svelocity/src/commands/create/next-steps.ts`
- Test: `packages/create-svelocity/src/commands/create/manifest.spec.ts`
- Test: `packages/create-svelocity/src/commands/create/next-steps.spec.ts`

**Interfaces:**
- Consumes: `Manifest`, `validateAgainstSchema` from `../../lib/manifest.js`.
- Produces:
  - `buildManifest(opts: { cliVersion: string; stackVersion: string; packageManager: string }): Manifest` — golden-path values: targets `['web','desktop','mobile']`, ui `bits-ui`, auth `convex-auth`, backend `convex`, empty `aiTargets`/`skills`
  - `writeProjectManifest(projectRoot: string, manifest: Manifest): void` — writes `.svelocity/manifest.json` (tab-indented JSON + trailing newline), throws if it violates the project's schema
  - `nextSteps(opts: { projectName: string; convexNow: boolean }): string` — the footer block printed after create

- [ ] **Step 1: Write failing tests**

`packages/create-svelocity/src/commands/create/manifest.spec.ts`:

```ts
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildManifest, writeProjectManifest } from './manifest.js';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../../../..');
const schemaSrc = readFileSync(join(repoRoot, '.svelocity/manifest.schema.json'), 'utf8');

describe('buildManifest', () => {
	it('produces a golden-path manifest', () => {
		const m = buildManifest({ cliVersion: '0.1.0', stackVersion: '0.1.0', packageManager: 'pnpm@10.33.2' });
		expect(m.createdWith).toBe('create-svelocity@0.1.0');
		expect(m.targets).toEqual(['web', 'desktop', 'mobile']);
		expect(m.ui).toBe('bits-ui');
		expect(m.auth).toBe('convex-auth');
		expect(m.backend).toBe('convex');
	});
});

describe('writeProjectManifest', () => {
	it('writes schema-valid manifest into .svelocity/', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-mwrite-'));
		mkdirSync(join(root, '.svelocity'));
		writeFileSync(join(root, '.svelocity/manifest.schema.json'), schemaSrc);
		const m = buildManifest({ cliVersion: '0.1.0', stackVersion: '0.1.0', packageManager: 'pnpm@10.33.2' });
		writeProjectManifest(root, m);
		const written = JSON.parse(readFileSync(join(root, '.svelocity/manifest.json'), 'utf8'));
		expect(written.stackVersion).toBe('0.1.0');
	});

	it('throws when manifest violates the schema', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-mbad-'));
		mkdirSync(join(root, '.svelocity'));
		writeFileSync(join(root, '.svelocity/manifest.schema.json'), schemaSrc);
		const m = buildManifest({ cliVersion: '0.1.0', stackVersion: '0.1.0', packageManager: 'npm@1.0.0' });
		expect(() => writeProjectManifest(root, m)).toThrow(/packageManager/);
	});
});
```

`packages/create-svelocity/src/commands/create/next-steps.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { nextSteps } from './next-steps.js';

describe('nextSteps', () => {
	it('always includes cd, convex, dev, and cap add guidance', () => {
		const text = nextSteps({ projectName: 'acme-app', convexNow: false });
		expect(text).toContain('cd acme-app');
		expect(text).toContain('pnpm --filter @svelocity/backend dev');
		expect(text).toContain('pnpm dev');
		expect(text).toContain('cap add ios');
		expect(text).toContain('svelocity doctor');
	});

	it('expands the convex walkthrough when convexNow', () => {
		const now = nextSteps({ projectName: 'acme-app', convexNow: true });
		expect(now).toContain('PUBLIC_CONVEX_URL');
		expect(now).toContain('.env.local');
	});
});
```

- [ ] **Step 2: Run tests, verify failure**

```bash
pnpm --filter create-svelocity exec vitest run src/commands/create
```

Expected: FAIL — modules missing (scaffold tests from Task 6 still pass).

- [ ] **Step 3: Implement**

`packages/create-svelocity/src/commands/create/manifest.ts`:

```ts
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateAgainstSchema, type Manifest } from '../../lib/manifest.js';

export function buildManifest(opts: {
	cliVersion: string;
	stackVersion: string;
	packageManager: string;
}): Manifest {
	return {
		stackVersion: opts.stackVersion,
		createdWith: `create-svelocity@${opts.cliVersion}`,
		targets: ['web', 'desktop', 'mobile'],
		ui: 'bits-ui',
		auth: 'convex-auth',
		backend: 'convex',
		packageManager: opts.packageManager,
		aiTargets: [],
		skills: []
	};
}

export function writeProjectManifest(projectRoot: string, manifest: Manifest): void {
	const schemaPath = join(projectRoot, '.svelocity/manifest.schema.json');
	if (existsSync(schemaPath)) {
		const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as unknown;
		const errors = validateAgainstSchema(manifest, schema);
		if (errors.length > 0) {
			throw new Error(`generated manifest is invalid:\n  ${errors.join('\n  ')}`);
		}
	}
	writeFileSync(
		join(projectRoot, '.svelocity/manifest.json'),
		JSON.stringify(manifest, null, '\t') + '\n'
	);
}
```

`packages/create-svelocity/src/commands/create/next-steps.ts`:

```ts
import { colors } from '../../lib/output.js';

export function nextSteps(opts: { projectName: string; convexNow: boolean }): string {
	const convexBlock = opts.convexNow
		? [
				'# Set up Convex (creates a deployment and fills backend env):',
				'pnpm --filter @svelocity/backend dev',
				'# When it prints your deployment URL, point the web app at it:',
				'cp apps/web/.env.example apps/web/.env.local',
				'#   then set PUBLIC_CONVEX_URL in apps/web/.env.local',
				''
			]
		: [
				'# When ready, set up Convex:',
				'pnpm --filter @svelocity/backend dev',
				'cp apps/web/.env.example apps/web/.env.local   # set PUBLIC_CONVEX_URL',
				''
			];

	return [
		'',
		colors.bold('Next steps:'),
		'',
		`cd ${opts.projectName}`,
		'',
		...convexBlock,
		'# Run the apps:',
		'pnpm dev            # web',
		'pnpm dev:desktop    # desktop (Electron)',
		'pnpm dev:mobile     # mobile web shell',
		'',
		'# Generate native mobile projects (one-time):',
		'pnpm --filter mobile exec cap add ios',
		'pnpm --filter mobile exec cap add android',
		'',
		'# Health check any time:',
		'pnpm exec svelocity doctor',
		''
	].join('\n');
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
pnpm --filter create-svelocity exec vitest run src/commands/create
```

Expected: PASS (scaffold 2 + manifest 3 + next-steps 2 = 7 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/create-svelocity/src/commands/create
git commit -m "feat: manifest generation and next-steps output for create"
```

---

### Task 8: `create` command wiring (`src/create.ts`)

**Files:**
- Create: `packages/create-svelocity/src/create.ts`

**Interfaces:**
- Consumes: `scaffold`, `buildManifest`, `writeProjectManifest`, `nextSteps`, `replaceTokens` helpers, `toDisplayName`, `toAppId`, `isValidAppId`, `run`, `commandVersion`, `satisfiesMin`, `MIN_NODE`, `MIN_PNPM`, `colors`.
- Produces: the `create-svelocity` bin. Flags: `--name <name>`, `--app-id <id>`, `--yes` (accept defaults, no prompts), `--no-git`, `--no-install`. Interactive when flags absent. Template dir resolved relative to the module: `../template` from `dist/`, so in dev (`src/`) it also resolves to the package's `template/` — both are `new URL('../template', import.meta.url)`.

No unit test for this file (it is glue); it is covered by the Task 11 integration test and a non-interactive smoke run in Step 3 below.

- [ ] **Step 1: Implement**

`packages/create-svelocity/src/create.ts`:

```ts
#!/usr/bin/env node
import { cancel, confirm, intro, isCancel, note, outro, select, spinner, text } from '@clack/prompts';
import { defineCommand, runMain } from 'citty';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import validateNpmName from 'validate-npm-package-name';
import { buildManifest, writeProjectManifest } from './commands/create/manifest.js';
import { nextSteps } from './commands/create/next-steps.js';
import { scaffold } from './commands/create/scaffold.js';
import { colors } from './lib/output.js';
import { commandVersion, run } from './lib/proc.js';
import { isValidAppId, toAppId, toDisplayName, type TokenMap } from './lib/tokens.js';
import { MIN_NODE, MIN_PNPM, satisfiesMin } from './lib/versions.js';

const pkgRoot = resolve(fileURLToPath(import.meta.url), '../..');
const templateDir = join(pkgRoot, 'template');
const cliPkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as {
	version: string;
};

function fail(message: string): never {
	console.error(`${colors.red('✗')} ${message}`);
	process.exit(1);
}

function guard<T>(value: T | symbol): T {
	if (isCancel(value)) {
		cancel('Cancelled.');
		process.exit(1);
	}
	return value as T;
}

const main = defineCommand({
	meta: { name: 'create-svelocity', version: cliPkg.version, description: 'Scaffold a Svelocity Stack project' },
	args: {
		name: { type: 'string', description: 'Project name (also the target directory)' },
		'app-id': { type: 'string', description: 'Reverse-DNS app id, e.g. com.acme.app' },
		yes: { type: 'boolean', description: 'Accept all defaults, no prompts' },
		git: { type: 'boolean', default: true, description: 'Initialize a git repository' },
		install: { type: 'boolean', default: true, description: 'Run pnpm install' }
	},
	async run({ args }) {
		intro(colors.bold('create-svelocity'));

		// Environment gates — fail fast, actionable.
		if (!satisfiesMin(process.version, MIN_NODE)) {
			fail(`Node ${MIN_NODE}+ required (you have ${process.version}). Install: https://nodejs.org`);
		}
		const pnpmVersion = await commandVersion('pnpm');
		if (!pnpmVersion) fail('pnpm not found. Install: npm install -g pnpm  (or corepack enable pnpm)');
		if (!satisfiesMin(pnpmVersion, MIN_PNPM)) {
			fail(`pnpm ${MIN_PNPM}+ required (you have ${pnpmVersion}). Upgrade: npm install -g pnpm`);
		}
		if (!existsSync(templateDir)) {
			fail('template/ missing — run `pnpm --filter create-svelocity build:template` first (dev) or reinstall the package.');
		}

		// Project name.
		let name = args.name;
		if (!name && args.yes) fail('--yes requires --name');
		if (!name) {
			name = guard(
				await text({
					message: 'Project name',
					placeholder: 'my-app',
					validate(value) {
						const result = validateNpmName(value ?? '');
						if (!result.validForNewPackages) {
							return (result.errors ?? result.warnings ?? ['invalid name']).join(', ');
						}
						if (existsSync(resolve(value)) && readdirSync(resolve(value)).length > 0) {
							return `directory ${value} exists and is not empty`;
						}
					}
				})
			);
		}
		const nameCheck = validateNpmName(name);
		if (!nameCheck.validForNewPackages) {
			fail(`invalid project name ${JSON.stringify(name)}: ${(nameCheck.errors ?? nameCheck.warnings ?? []).join(', ')}`);
		}
		const targetDir = resolve(name);
		if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
			fail(`directory ${name} exists and is not empty — pick a new name or empty it.`);
		}

		// App id.
		let appId = args['app-id'] ?? (args.yes ? toAppId(name) : undefined);
		if (!appId) {
			appId = guard(
				await text({
					message: 'App id (reverse-DNS, used by desktop + mobile builds)',
					initialValue: toAppId(name),
					validate: (value) => (isValidAppId(value ?? '') ? undefined : 'must look like com.acme.app')
				})
			);
		}
		if (!isValidAppId(appId)) fail(`invalid app id ${JSON.stringify(appId)} — must look like com.acme.app`);

		// Golden-path summary (no toggles in v1).
		note(
			['Bits UI (headless components)', 'Convex backend + Convex Auth', 'Targets: web, desktop (Electron), mobile (Capacitor)'].join('\n'),
			'Golden-path stack'
		);

		let convexNow = false;
		if (!args.yes) {
			convexNow =
				guard(
					await select({
						message: 'Convex backend setup',
						options: [
							{ value: false, label: "I'll set up Convex later", hint: 'instructions printed at the end' },
							{ value: true, label: 'Show me the Convex walkthrough now' }
						]
					})
				) === true;
		}
		const doGit = args.yes ? args.git : guard(await confirm({ message: 'Initialize git repository?', initialValue: args.git }));
		const doInstall = args.yes ? args.install : guard(await confirm({ message: 'Install dependencies?', initialValue: args.install }));

		// Scaffold.
		const tokens: TokenMap = { PROJECT_NAME: name, DISPLAY_NAME: toDisplayName(name), APP_ID: appId };
		const s = spinner();
		s.start('Copying template');
		scaffold(templateDir, targetDir, tokens);
		const rootPkg = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf8')) as {
			version?: string;
			packageManager?: string;
		};
		writeProjectManifest(
			targetDir,
			buildManifest({
				cliVersion: cliPkg.version,
				stackVersion: rootPkg.version ?? '0.1.0',
				packageManager: rootPkg.packageManager ?? 'pnpm@10.0.0'
			})
		);
		s.stop('Template copied');

		if (doGit) {
			const init = await run('git', ['init', '-b', 'main'], { cwd: targetDir });
			if (init.code === 0) {
				await run('git', ['add', '-A'], { cwd: targetDir });
				await run('git', ['commit', '-m', 'Initial commit from create-svelocity'], { cwd: targetDir });
				console.log(`${colors.green('✓')} git repository initialized`);
			} else {
				console.log(`${colors.yellow('▲')} git init failed — continuing without git`);
			}
		}

		if (doInstall) {
			console.log(colors.dim('Running pnpm install…'));
			const install = await run('pnpm', ['install'], { cwd: targetDir, inherit: true });
			if (install.code !== 0) fail('pnpm install failed — see output above. Fix and re-run `pnpm install` inside the project.');
		}

		console.log(nextSteps({ projectName: name, convexNow }));
		outro(colors.green(`${name} is ready.`));
	}
});

runMain(main);
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter create-svelocity check
```

Expected: clean. (If `validate-npm-package-name` default-import types complain, switch to `import { default as validateNpmName } from ...` or namespace import per its `@types` package.)

- [ ] **Step 3: Non-interactive smoke run**

Create `packages/create-svelocity/tsdown.config.ts` now (exact content is in Task 10 Step 3 — Task 10 then skips creating it), build, and run:

```bash
pnpm --filter create-svelocity build
cd "$(mktemp -d)" && node /Users/emmanueladdey/Documents/Addey-The-Dev/Svelocity-Stack/packages/create-svelocity/dist/create.js --name smoke-app --yes --no-install --no-git
ls smoke-app/.svelocity/manifest.json smoke-app/.gitignore smoke-app/pnpm-lock.yaml
grep '"name": "smoke-app"' smoke-app/package.json
grep 'com.example.smokeapp' smoke-app/apps/mobile/capacitor.config.ts
```

Expected: `ls` lists all three files; both greps match. (`cli.ts` doesn't exist until Task 10 — if tsdown errors on the missing entry, temporarily set `entry: ['src/create.ts']` and restore the full entry list in Task 10.)

- [ ] **Step 4: Commit**

```bash
git add packages/create-svelocity/src/create.ts
git commit -m "feat: create command — prompts, flags, scaffold, git, install"
```

---

### Task 9: Doctor checks (`commands/doctor/checks.ts`)

**Files:**
- Create: `packages/create-svelocity/src/commands/doctor/checks.ts`
- Test: `packages/create-svelocity/src/commands/doctor/checks.spec.ts`

**Interfaces:**
- Consumes: `CheckStatus` from `../../lib/output.js`; `readManifest`, `Manifest` from `../../lib/manifest.js`; `satisfiesMin`, `MIN_NODE`, `MIN_PNPM`, `commandVersion`.
- Produces:
  - `interface CheckResult { category: string; name: string; status: CheckStatus; message: string; fix?: string }`
  - `checkEnvironment(): Promise<CheckResult[]>` — node + pnpm versions
  - `checkWorkspace(root: string): CheckResult[]` — `pnpm-workspace.yaml`, `apps/`, `packages/` exist
  - `checkManifest(root: string): { results: CheckResult[]; manifest: Manifest | null }`
  - `checkConvex(root: string): CheckResult[]` — `packages/backend/convex/` exists (FAIL); `apps/web/.env.local`/`.env` with `PUBLIC_CONVEX_URL` (WARN)
  - `checkAuth(root: string): CheckResult[]` — `packages/backend/convex/auth.ts` + `auth.config.ts` (WARN)
  - `checkTargets(root: string, manifest: Manifest | null): CheckResult[]` — per target; mobile native dirs = WARN with `cap add` fix
  - `checkNativeTooling(): Promise<CheckResult[]>` — Xcode (`xcodebuild -version`, macOS only) + Android SDK (`ANDROID_HOME`/`ANDROID_SDK_ROOT`), all WARN

- [ ] **Step 1: Write failing tests**

`packages/create-svelocity/src/commands/doctor/checks.spec.ts`:

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkConvex, checkTargets, checkWorkspace } from './checks.js';

function makeProject(): string {
	const root = mkdtempSync(join(tmpdir(), 'sv-doctor-'));
	writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n  - packages/*\n');
	for (const dir of [
		'apps/web',
		'apps/desktop',
		'apps/mobile',
		'packages/backend/convex',
		'.svelocity'
	]) {
		mkdirSync(join(root, dir), { recursive: true });
	}
	writeFileSync(join(root, 'apps/mobile/capacitor.config.ts'), "appId: 'com.acme.app'");
	writeFileSync(join(root, 'apps/desktop/package.json'), '{"devDependencies":{"electron":"^38.0.0"}}');
	return root;
}

const manifest = {
	stackVersion: '0.1.0',
	createdWith: 'create-svelocity@0.1.0',
	targets: ['web', 'desktop', 'mobile'],
	ui: 'bits-ui',
	auth: 'convex-auth',
	backend: 'convex',
	packageManager: 'pnpm@10.33.2',
	aiTargets: [],
	skills: []
};

describe('checkWorkspace', () => {
	it('passes on a complete workspace and fails on a bare dir', () => {
		expect(checkWorkspace(makeProject()).every((r) => r.status === 'pass')).toBe(true);
		const bare = mkdtempSync(join(tmpdir(), 'sv-bare-'));
		expect(checkWorkspace(bare).some((r) => r.status === 'fail')).toBe(true);
	});
});

describe('checkConvex', () => {
	it('fails without convex dir, warns without env', () => {
		const root = makeProject();
		const results = checkConvex(root);
		expect(results.find((r) => r.name === 'convex directory')?.status).toBe('pass');
		expect(results.find((r) => r.name === 'PUBLIC_CONVEX_URL')?.status).toBe('warn');

		const bare = mkdtempSync(join(tmpdir(), 'sv-noconvex-'));
		expect(checkConvex(bare).find((r) => r.name === 'convex directory')?.status).toBe('fail');
	});

	it('passes env check when .env.local sets PUBLIC_CONVEX_URL', () => {
		const root = makeProject();
		writeFileSync(join(root, 'apps/web/.env.local'), 'PUBLIC_CONVEX_URL=http://127.0.0.1:3210\n');
		expect(checkConvex(root).find((r) => r.name === 'PUBLIC_CONVEX_URL')?.status).toBe('pass');
	});
});

describe('checkTargets', () => {
	it('warns (not fails) on missing native dirs with a cap add fix', () => {
		const results = checkTargets(makeProject(), manifest);
		const native = results.find((r) => r.name === 'mobile native projects');
		expect(native?.status).toBe('warn');
		expect(native?.fix).toContain('cap add');
		expect(results.filter((r) => r.status === 'fail')).toEqual([]);
	});

	it('fails when a manifest target directory is missing', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-notargets-'));
		const results = checkTargets(root, manifest);
		expect(results.some((r) => r.status === 'fail')).toBe(true);
	});
});
```

- [ ] **Step 2: Run tests, verify failure**

```bash
pnpm --filter create-svelocity exec vitest run src/commands/doctor/checks.spec.ts
```

Expected: FAIL — cannot resolve `./checks.js`.

- [ ] **Step 3: Implement**

`packages/create-svelocity/src/commands/doctor/checks.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readManifest, type Manifest } from '../../lib/manifest.js';
import type { CheckStatus } from '../../lib/output.js';
import { commandVersion } from '../../lib/proc.js';
import { MIN_NODE, MIN_PNPM, satisfiesMin } from '../../lib/versions.js';

export interface CheckResult {
	category: string;
	name: string;
	status: CheckStatus;
	message: string;
	fix?: string;
}

const result = (
	category: string,
	name: string,
	status: CheckStatus,
	message: string,
	fix?: string
): CheckResult => ({ category, name, status, message, fix });

export async function checkEnvironment(): Promise<CheckResult[]> {
	const results: CheckResult[] = [];
	results.push(
		satisfiesMin(process.version, MIN_NODE)
			? result('environment', 'node', 'pass', process.version)
			: result('environment', 'node', 'fail', `${process.version} < required ${MIN_NODE}`, `install Node ${MIN_NODE}+`)
	);
	const pnpm = await commandVersion('pnpm');
	if (!pnpm) {
		results.push(result('environment', 'pnpm', 'fail', 'not found', 'npm install -g pnpm'));
	} else {
		results.push(
			satisfiesMin(pnpm, MIN_PNPM)
				? result('environment', 'pnpm', 'pass', pnpm)
				: result('environment', 'pnpm', 'fail', `${pnpm} < required ${MIN_PNPM}`, 'npm install -g pnpm')
		);
	}
	return results;
}

export function checkWorkspace(root: string): CheckResult[] {
	const entries: Array<[string, string]> = [
		['pnpm-workspace.yaml', 'pnpm-workspace.yaml'],
		['apps directory', 'apps'],
		['packages directory', 'packages']
	];
	return entries.map(([name, rel]) =>
		existsSync(join(root, rel))
			? result('workspace', name, 'pass', 'present')
			: result('workspace', name, 'fail', `${rel} missing`)
	);
}

export function checkManifest(root: string): { results: CheckResult[]; manifest: Manifest | null } {
	const { manifest, errors } = readManifest(root);
	if (!manifest) {
		return {
			results: [result('manifest', '.svelocity/manifest.json', 'fail', errors.join('; '), 'run create-svelocity to regenerate, or restore the file')],
			manifest: null
		};
	}
	if (errors.length > 0) {
		return { results: [result('manifest', 'schema validation', 'fail', errors.join('; '))], manifest };
	}
	return { results: [result('manifest', 'schema validation', 'pass', `stackVersion ${manifest.stackVersion}`)], manifest };
}

export function checkConvex(root: string): CheckResult[] {
	const results: CheckResult[] = [];
	results.push(
		existsSync(join(root, 'packages/backend/convex'))
			? result('convex', 'convex directory', 'pass', 'packages/backend/convex')
			: result('convex', 'convex directory', 'fail', 'packages/backend/convex missing')
	);
	const envFiles = ['apps/web/.env.local', 'apps/web/.env', '.env.local', '.env'];
	const hasUrl = envFiles.some(
		(f) => existsSync(join(root, f)) && readFileSync(join(root, f), 'utf8').includes('PUBLIC_CONVEX_URL')
	);
	results.push(
		hasUrl
			? result('convex', 'PUBLIC_CONVEX_URL', 'pass', 'set in env file')
			: result('convex', 'PUBLIC_CONVEX_URL', 'warn', 'no env file sets it', 'cp apps/web/.env.example apps/web/.env.local and set PUBLIC_CONVEX_URL')
	);
	return results;
}

export function checkAuth(root: string): CheckResult[] {
	return [
		existsSync(join(root, 'packages/backend/convex/auth.ts')) &&
		existsSync(join(root, 'packages/backend/convex/auth.config.ts'))
			? result('auth', 'convex auth config', 'pass', 'auth.ts + auth.config.ts present')
			: result('auth', 'convex auth config', 'warn', 'auth.ts / auth.config.ts missing in packages/backend/convex')
	];
}

export function checkTargets(root: string, manifest: Manifest | null): CheckResult[] {
	const targets = manifest?.targets ?? ['web', 'desktop', 'mobile'];
	const results: CheckResult[] = [];
	if (targets.includes('web')) {
		results.push(
			existsSync(join(root, 'apps/web'))
				? result('targets', 'web app', 'pass', 'apps/web present')
				: result('targets', 'web app', 'fail', 'apps/web missing')
		);
	}
	if (targets.includes('desktop')) {
		const pkgPath = join(root, 'apps/desktop/package.json');
		const hasElectron = existsSync(pkgPath) && readFileSync(pkgPath, 'utf8').includes('"electron"');
		results.push(
			hasElectron
				? result('targets', 'desktop app', 'pass', 'apps/desktop with electron dep')
				: result('targets', 'desktop app', 'fail', 'apps/desktop missing or electron dep absent')
		);
	}
	if (targets.includes('mobile')) {
		results.push(
			existsSync(join(root, 'apps/mobile/capacitor.config.ts'))
				? result('targets', 'mobile app', 'pass', 'capacitor.config.ts present')
				: result('targets', 'mobile app', 'fail', 'apps/mobile/capacitor.config.ts missing')
		);
		const hasNative = existsSync(join(root, 'apps/mobile/ios')) && existsSync(join(root, 'apps/mobile/android'));
		results.push(
			hasNative
				? result('targets', 'mobile native projects', 'pass', 'ios/ + android/ present')
				: result('targets', 'mobile native projects', 'warn', 'native projects not generated yet', 'pnpm --filter mobile exec cap add ios && pnpm --filter mobile exec cap add android')
		);
	}
	return results;
}

export async function checkNativeTooling(): Promise<CheckResult[]> {
	const results: CheckResult[] = [];
	const androidHome = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT;
	results.push(
		androidHome && existsSync(androidHome)
			? result('native tooling', 'android sdk', 'pass', androidHome)
			: result('native tooling', 'android sdk', 'warn', 'ANDROID_HOME/ANDROID_SDK_ROOT not set', 'install Android Studio (needed for Android builds only)')
	);
	if (process.platform === 'darwin') {
		const xcode = await commandVersion('xcodebuild');
		results.push(
			xcode
				? result('native tooling', 'xcode', 'pass', xcode.split('\n')[0])
				: result('native tooling', 'xcode', 'warn', 'xcodebuild not found', 'install Xcode (needed for iOS builds only)')
		);
	}
	return results;
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
pnpm --filter create-svelocity exec vitest run src/commands/doctor/checks.spec.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/create-svelocity/src/commands/doctor
git commit -m "feat: doctor static checks — env, workspace, manifest, convex, auth, targets, native"
```

---

### Task 10: Doctor runner + `svelocity` bin + info command

**Files:**
- Create: `packages/create-svelocity/src/commands/doctor/run.ts`
- Create: `packages/create-svelocity/src/commands/info/info.ts`
- Create: `packages/create-svelocity/src/cli.ts`
- Create: `packages/create-svelocity/tsdown.config.ts` (if not created during Task 8 Step 3)
- Test: `packages/create-svelocity/src/commands/info/info.spec.ts`

**Interfaces:**
- Consumes: all check functions (Task 9), `findProjectRoot`, `readManifest`, `glyph`, `colors`.
- Produces:
  - `runDoctor(cwd: string): Promise<number>` — prints grouped report, returns exit code (1 if any FAIL)
  - `renderInfo(manifest: Manifest): string` — pure formatter (testable)
  - `svelocity` bin with `doctor` and `info` subcommands

- [ ] **Step 1: Write failing test for info rendering**

`packages/create-svelocity/src/commands/info/info.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { renderInfo } from './info.js';

const manifest = {
	stackVersion: '0.1.0',
	createdWith: 'create-svelocity@0.1.0',
	targets: ['web', 'desktop', 'mobile'],
	ui: 'bits-ui',
	auth: 'convex-auth',
	backend: 'convex',
	packageManager: 'pnpm@10.33.2',
	aiTargets: [],
	skills: []
};

describe('renderInfo', () => {
	it('renders every manifest field', () => {
		const text = renderInfo(manifest);
		expect(text).toContain('0.1.0');
		expect(text).toContain('create-svelocity@0.1.0');
		expect(text).toContain('web, desktop, mobile');
		expect(text).toContain('bits-ui');
		expect(text).toContain('convex-auth');
		expect(text).toContain('pnpm@10.33.2');
		expect(text).toContain('docs/COMPATIBILITY.md');
	});

	it('renders (none) for empty lists', () => {
		expect(renderInfo({ ...manifest, skills: [] })).toContain('(none)');
	});
});
```

- [ ] **Step 2: Run test, verify failure**

```bash
pnpm --filter create-svelocity exec vitest run src/commands/info/info.spec.ts
```

Expected: FAIL — cannot resolve `./info.js`.

- [ ] **Step 3: Implement info, doctor runner, cli entry, tsdown config**

`packages/create-svelocity/src/commands/info/info.ts`:

```ts
import type { Manifest } from '../../lib/manifest.js';
import { colors } from '../../lib/output.js';

export function renderInfo(manifest: Manifest): string {
	const list = (items: string[]) => (items.length > 0 ? items.join(', ') : '(none)');
	return [
		colors.bold('Svelocity project'),
		'',
		`  stack version    ${manifest.stackVersion}`,
		`  created with     ${manifest.createdWith}`,
		`  targets          ${list(manifest.targets)}`,
		`  ui               ${manifest.ui}`,
		`  auth             ${manifest.auth}`,
		`  backend          ${manifest.backend}`,
		`  package manager  ${manifest.packageManager}`,
		`  ai targets       ${list(manifest.aiTargets)}`,
		`  skills           ${list(manifest.skills)}`,
		'',
		`  version pins: pnpm-workspace.yaml (catalog) — rationale in docs/COMPATIBILITY.md`
	].join('\n');
}
```

`packages/create-svelocity/src/commands/doctor/run.ts`:

```ts
import { findProjectRoot } from '../../lib/manifest.js';
import { colors, glyph } from '../../lib/output.js';
import {
	checkAuth,
	checkConvex,
	checkEnvironment,
	checkManifest,
	checkNativeTooling,
	checkTargets,
	checkWorkspace,
	type CheckResult
} from './checks.js';

export async function runDoctor(cwd: string): Promise<number> {
	const root = findProjectRoot(cwd);
	if (!root) {
		console.error(`${glyph('fail')} not inside a Svelocity project (no .svelocity/manifest.json found walking up from ${cwd})`);
		return 1;
	}
	console.log(`${colors.bold('svelocity doctor')} ${colors.dim(root)}\n`);

	const { results: manifestResults, manifest } = checkManifest(root);
	const all: CheckResult[] = [
		...(await checkEnvironment()),
		...checkWorkspace(root),
		...manifestResults,
		...checkConvex(root),
		...checkAuth(root),
		...checkTargets(root, manifest),
		...(await checkNativeTooling())
	];

	let category = '';
	for (const r of all) {
		if (r.category !== category) {
			category = r.category;
			console.log(colors.bold(category));
		}
		console.log(`  ${glyph(r.status)} ${r.name} — ${r.message}`);
		if (r.fix && r.status !== 'pass') console.log(`      ${colors.dim(`fix: ${r.fix}`)}`);
	}

	const counts = { pass: 0, warn: 0, fail: 0 };
	for (const r of all) counts[r.status] += 1;
	console.log(
		`\n${colors.green(`${counts.pass} pass`)}, ${colors.yellow(`${counts.warn} warn`)}, ${colors.red(`${counts.fail} fail`)}`
	);
	return counts.fail > 0 ? 1 : 0;
}
```

`packages/create-svelocity/src/cli.ts`:

```ts
#!/usr/bin/env node
import { defineCommand, runMain } from 'citty';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runDoctor } from './commands/doctor/run.js';
import { renderInfo } from './commands/info/info.js';
import { findProjectRoot, readManifest } from './lib/manifest.js';
import { colors, glyph } from './lib/output.js';

const pkgRoot = resolve(fileURLToPath(import.meta.url), '../..');
const cliPkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as { version: string };

const doctor = defineCommand({
	meta: { name: 'doctor', description: 'Static health checks for a Svelocity project' },
	async run() {
		process.exit(await runDoctor(process.cwd()));
	}
});

const info = defineCommand({
	meta: { name: 'info', description: 'Show what the CLI generated (manifest + stack)' },
	run() {
		const root = findProjectRoot(process.cwd());
		if (!root) {
			console.error(`${glyph('fail')} not inside a Svelocity project — no .svelocity/manifest.json found. Run ${colors.bold('svelocity doctor')} for details or create-svelocity for a new project.`);
			process.exit(1);
		}
		const { manifest, errors } = readManifest(root);
		if (!manifest) {
			console.error(`${glyph('fail')} could not read manifest: ${errors.join('; ')}\n  try ${colors.bold('svelocity doctor')}`);
			process.exit(1);
		}
		if (errors.length > 0) {
			console.error(`${glyph('warn')} manifest has schema issues — run ${colors.bold('svelocity doctor')}`);
		}
		console.log(renderInfo(manifest));
	}
});

runMain(
	defineCommand({
		meta: { name: 'svelocity', version: cliPkg.version, description: 'Svelocity Stack project tooling' },
		subCommands: { doctor, info }
	})
);
```

`packages/create-svelocity/tsdown.config.ts`:

```ts
import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['src/create.ts', 'src/cli.ts'],
	format: 'esm',
	platform: 'node',
	noExternal: [/.*/],
	dts: false,
	clean: true
});
```

- [ ] **Step 4: Run tests + typecheck, verify pass**

```bash
pnpm --filter create-svelocity exec vitest run src/commands/info/info.spec.ts
pnpm --filter create-svelocity check
```

Expected: PASS (2 tests), check clean.

- [ ] **Step 5: Smoke doctor against this repo**

This repo has `.svelocity/manifest.json`, so it is itself a valid doctor target:

```bash
pnpm --filter create-svelocity build
cd /Users/emmanueladdey/Documents/Addey-The-Dev/Svelocity-Stack && node packages/create-svelocity/dist/cli.js doctor; echo "exit: $?"
node packages/create-svelocity/dist/cli.js info
```

Expected: doctor prints grouped report; native dirs exist here so mobile natives PASS; Android SDK WARN on this machine; `PUBLIC_CONVEX_URL` may WARN (no .env.local committed); exit 0 (no FAILs). info renders manifest.

- [ ] **Step 6: Commit**

```bash
git add packages/create-svelocity/src/cli.ts packages/create-svelocity/src/commands/doctor/run.ts packages/create-svelocity/src/commands/info packages/create-svelocity/tsdown.config.ts
git commit -m "feat: svelocity bin — doctor runner with report and info command"
```

---

### Task 11: End-to-end integration test (gated)

**Files:**
- Create: `packages/create-svelocity/tests/integration.spec.ts`

**Interfaces:**
- Consumes: built `dist/create.js` + `dist/cli.js` and `template/` (runs `pnpm --filter create-svelocity build` in setup).
- Produces: proof that `create → install → check → doctor` works end-to-end. Gated by `CLI_INTEGRATION=1` (slow: full pnpm install).

- [ ] **Step 1: Write the test**

`packages/create-svelocity/tests/integration.spec.ts`:

```ts
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const pkgRoot = resolve(fileURLToPath(import.meta.url), '../..');
const gated = describe.skipIf(process.env.CLI_INTEGRATION !== '1');

gated('create-svelocity end to end', () => {
	const work = mkdtempSync(join(tmpdir(), 'sv-e2e-'));
	const project = join(work, 'e2e-app');

	beforeAll(() => {
		execFileSync('pnpm', ['--filter', 'create-svelocity', 'build'], { cwd: pkgRoot, stdio: 'inherit' });
		execFileSync(
			'node',
			[join(pkgRoot, 'dist/create.js'), '--name', 'e2e-app', '--yes', '--no-git'],
			{ cwd: work, stdio: 'inherit' }
		);
	}, 900_000);

	it('generated a schema-valid project', () => {
		expect(existsSync(join(project, '.svelocity/manifest.json'))).toBe(true);
		expect(existsSync(join(project, '.gitignore'))).toBe(true);
		expect(existsSync(join(project, 'pnpm-lock.yaml'))).toBe(true);
		expect(readFileSync(join(project, 'package.json'), 'utf8')).toContain('"e2e-app"');
		expect(existsSync(join(project, 'apps/mobile/ios'))).toBe(false);
	});

	it('passes pnpm -r check', () => {
		execFileSync('pnpm', ['-r', 'check'], { cwd: project, stdio: 'inherit' });
	}, 900_000);

	it('doctor exits 0 (no FAILs) in the generated project', () => {
		execFileSync('node', [join(pkgRoot, 'dist/cli.js'), 'doctor'], { cwd: project, stdio: 'inherit' });
	}, 120_000);
});
```

Note: `--yes` with default `install: true` runs `pnpm install` inside create — that is the point of the e2e. `pnpm -r check` in the generated project requires the install to have succeeded.

- [ ] **Step 2: Run gated-off, verify skip**

```bash
pnpm --filter create-svelocity test
```

Expected: integration suite reported as skipped; all unit suites pass.

- [ ] **Step 3: Run gated-on locally once**

```bash
CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts
```

Expected: PASS (3 tests). Takes several minutes (full install + check). If `pnpm -r check` fails in the generated project, that is a real template bug — fix the exclude/tokenize lists or template content, not the test.

- [ ] **Step 4: Commit**

```bash
git add packages/create-svelocity/tests/integration.spec.ts
git commit -m "test: gated end-to-end create → install → check → doctor"
```

---

### Task 12: CI workflow for the CLI

**Files:**
- Create: `.github/workflows/cli.yml` (check existing workflows in `.github/workflows/` first and mirror their setup steps — pnpm/node versions, cache config)

**Interfaces:**
- Consumes: `CLI_INTEGRATION=1` gate from Task 11.
- Produces: CI job proving golden-path generation on every push/PR touching the CLI or template inputs.

- [ ] **Step 1: Read existing workflow for conventions**

```bash
ls .github/workflows/ && cat .github/workflows/*.yml | head -60
```

Mirror the checkout/pnpm/node setup steps exactly (action versions, cache).

- [ ] **Step 2: Create the workflow**

`.github/workflows/cli.yml` (adjust setup steps to match existing workflows):

```yaml
name: CLI golden path

on:
  push:
    branches: [main]
  pull_request:

jobs:
  cli:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Unit tests + typecheck
        run: |
          pnpm --filter create-svelocity check
          pnpm --filter create-svelocity test
      - name: Generate and validate golden path
        run: CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts
        env:
          CI: 'true'
```

- [ ] **Step 3: Validate workflow syntax locally**

```bash
pnpm dlx yaml-lint .github/workflows/cli.yml 2>/dev/null || node -e "console.log('skip: eyeball the YAML')"
git add .github/workflows/cli.yml && git commit -m "ci: golden-path generation job for create-svelocity"
```

Push and confirm the job goes green (or note it for the next push if working on a branch).

---

### Task 13: Docs, phase checklist, verification sweep

**Files:**
- Create: `packages/create-svelocity/README.md`
- Modify: `README.md` (root — quickstart mentions `pnpm create svelocity`)
- Modify: `docs/phases/phase-06-thin-cli.md` (tick completed boxes; annotate deliberate deviations)

**Interfaces:**
- Consumes: everything shipped in Tasks 1–12.

- [ ] **Step 1: Write the package README**

`packages/create-svelocity/README.md`:

```markdown
# create-svelocity

Scaffolder and project tooling for the [Svelocity Stack](../../README.md).

## Bins

- `create-svelocity` — scaffold a new project (`pnpm create svelocity` once published)
- `svelocity` — `doctor` (static health checks) and `info` (manifest display)

## How the template works

`scripts/build-template.mjs` snapshots the repo root into `template/` (gitignored):
excludes stack-only paths (`docs/phases`, `.github`, this package, native `ios`/`android` dirs),
renames dotfiles npm strips (`.gitignore` → `_gitignore`), and injects
`{{PROJECT_NAME}}` / `{{DISPLAY_NAME}}` / `{{APP_ID}}` tokens. `create` reverses all of it.

The repo IS the template — fix the golden path here, rebuild, done.

## Dev loop

\`\`\`bash
pnpm --filter create-svelocity build          # template + bundle
cd $(mktemp -d) && node <repo>/packages/create-svelocity/dist/create.js --name demo --yes --no-install
pnpm --filter create-svelocity test           # unit tests
CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts  # full e2e (slow)
\`\`\`

Publishing (Phase 10): remove `"private": true`, `pnpm publish` runs `prepublishOnly` → fresh template + dist.
```

(Un-escape the backticks as in Task 5.)

- [ ] **Step 2: Update root README quickstart**

Add near the top of root `README.md` (adapt to surrounding structure):

```markdown
## Create a new project

\`\`\`bash
pnpm create svelocity    # (until published: pnpm dlx ./packages/create-svelocity)
\`\`\`
```

- [ ] **Step 3: Tick the phase document**

Edit `docs/phases/phase-06-thin-cli.md`: check every completed box. Annotate deviations inline (do not silently skip):

- 6.2 "Extract golden-path repo into `templates/golden/`" → note: implemented as build-time snapshot to `packages/create-svelocity/template/` per spec.
- 6.2 lockfile decision → included.
- 6.3 Convex prompts → both paths print instructions (spec decision).
- Native dirs → excluded from template; `cap add` in next steps (spec decision).
- 6.10 deferred commands → already documented in the phase file; leave unchecked-but-annotated or tick per its "document only" framing.

- [ ] **Step 4: Full verification sweep**

```bash
pnpm --filter create-svelocity check && pnpm --filter create-svelocity test && pnpm lint && pnpm -r check
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add packages/create-svelocity/README.md README.md docs/phases/phase-06-thin-cli.md
git commit -m "docs: Phase 6 — CLI README, root quickstart, phase checklist"
```

---

## Exit Criteria (verify before calling Phase 6 done)

- [ ] `pnpm dlx ./packages/create-svelocity --name demo --yes` generates a working project (published `pnpm create svelocity` = Phase 10)
- [ ] Generated project passes `pnpm install && pnpm -r check && pnpm -r build`  ← run `pnpm -r build` once manually in the e2e project; if it needs `PUBLIC_CONVEX_URL`, document the env prerequisite in the package README
- [ ] `svelocity doctor` reports actionable PASS/WARN/FAIL, exit 1 on FAIL
- [ ] `svelocity info` displays the manifest
- [ ] CI job generates + validates the golden path
- [ ] `--help` output is clear on both bins (citty generates it; eyeball it)
- [ ] Phase 7 (skills) unblocked: template snapshot will automatically include `skills/` when Phase 7 adds it
