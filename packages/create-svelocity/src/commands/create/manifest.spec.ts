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
		const m = buildManifest({
			cliVersion: '0.1.0',
			stackVersion: '0.1.0',
			packageManager: 'pnpm@10.33.2'
		});
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
		const m = buildManifest({
			cliVersion: '0.1.0',
			stackVersion: '0.1.0',
			packageManager: 'pnpm@10.33.2'
		});
		writeProjectManifest(root, m);
		const written = JSON.parse(readFileSync(join(root, '.svelocity/manifest.json'), 'utf8'));
		expect(written.stackVersion).toBe('0.1.0');
	});

	it('throws when manifest violates the schema', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-mbad-'));
		mkdirSync(join(root, '.svelocity'));
		writeFileSync(join(root, '.svelocity/manifest.schema.json'), schemaSrc);
		const m = buildManifest({
			cliVersion: '0.1.0',
			stackVersion: '0.1.0',
			packageManager: 'npm@1.0.0'
		});
		expect(() => writeProjectManifest(root, m)).toThrow(/packageManager/);
	});
});
