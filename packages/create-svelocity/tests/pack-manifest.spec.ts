import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
	loadDefaultCatalog,
	loadWorkspacePackages,
	parseDefaultCatalog,
	postpack,
	prepack,
	rewriteManifest
} from '../scripts/pack-manifest.mjs';

const pkgRoot = resolve(fileURLToPath(import.meta.url), '../..');
const repoRoot = resolve(pkgRoot, '../..');

describe('pack-manifest', () => {
	it('reads the default catalog and stops before named catalogs', () => {
		const catalog = parseDefaultCatalog(`
catalog:
  # comment
  typescript: ^6.0.2
  '@types/node': ^22.15.0
catalogs:
  electron:
    electron: ^39.0.0
`);
		expect(catalog).toEqual({
			typescript: '^6.0.2',
			'@types/node': '^22.15.0'
		});
	});

	it('rewrites catalog: specifiers and drops private workspace packages', () => {
		const catalog = loadDefaultCatalog(repoRoot);
		const workspacePackages = loadWorkspacePackages(repoRoot);
		const manifest = JSON.parse(readFileSync(resolve(pkgRoot, 'package.json'), 'utf8'));
		const rewritten = rewriteManifest(manifest, catalog, workspacePackages);
		const encoded = JSON.stringify(rewritten);

		expect(encoded).not.toContain('catalog:');
		expect(encoded).not.toContain('workspace:');
		expect(rewritten.devDependencies.typescript).toBe(catalog.typescript);
		expect(rewritten.devDependencies.vitest).toBe(catalog.vitest);
		expect(rewritten.devDependencies['@types/node']).toBe(catalog['@types/node']);
		expect(rewritten.devDependencies.citty).toBe('^0.2.2');
		expect(rewritten.devDependencies).not.toHaveProperty('@svelocity/config');
		expect(rewritten.publishConfig).toEqual({
			registry: 'https://registry.npmjs.org',
			access: 'public'
		});
	});

	it('rejects named catalogs and public workspace specifiers', () => {
		const workspacePackages = new Map([['@svelocity/config', { private: true }]]);
		expect(() =>
			rewriteManifest({ devDependencies: { electron: 'catalog:electron' } }, {}, workspacePackages)
		).toThrow(/catalog:electron/);
		expect(() =>
			rewriteManifest({ dependencies: { '@svelocity/ui': 'workspace:*' } }, {}, workspacePackages)
		).toThrow(/not a private workspace package/);
	});

	it('restores package.json after prepack', () => {
		const pkgPath = resolve(pkgRoot, 'package.json');
		const before = readFileSync(pkgPath, 'utf8');
		try {
			prepack();
			const during = readFileSync(pkgPath, 'utf8');
			expect(during).not.toBe(before);
			expect(during).not.toContain('catalog:');
			expect(during).not.toContain('workspace:');
			expect(during).toContain('"access": "public"');
		} finally {
			postpack();
		}
		expect(readFileSync(pkgPath, 'utf8')).toBe(before);
	});
});
