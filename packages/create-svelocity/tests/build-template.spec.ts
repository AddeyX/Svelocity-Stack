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
