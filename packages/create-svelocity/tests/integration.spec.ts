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
		execFileSync('pnpm', ['--filter', 'create-svelocity', 'build'], {
			cwd: pkgRoot,
			stdio: 'inherit'
		});
		execFileSync(
			'node',
			[join(pkgRoot, 'dist/create.js'), '--name', 'e2e-app', '--yes', '--no-git'],
			{
				cwd: work,
				stdio: 'inherit'
			}
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

	it('passes pnpm -r build', () => {
		execFileSync('pnpm', ['-r', 'build'], { cwd: project, stdio: 'inherit' });
	}, 900_000);

	it('doctor exits 0 (no FAILs) in the generated project', () => {
		execFileSync('node', [join(pkgRoot, 'dist/cli.js'), 'doctor'], {
			cwd: project,
			stdio: 'inherit'
		});
	}, 120_000);
});
