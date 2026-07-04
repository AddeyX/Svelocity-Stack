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

	it('reports a corrupted schema file instead of throwing', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-badschema-'));
		mkdirSync(join(root, '.svelocity'), { recursive: true });
		writeFileSync(join(root, '.svelocity/manifest.json'), JSON.stringify(valid));
		writeFileSync(join(root, '.svelocity/manifest.schema.json'), '{ not json');
		const { manifest, errors } = readManifest(root);
		expect(manifest).not.toBeNull();
		expect(errors.some((e) => e.includes('manifest.schema.json'))).toBe(true);
	});
});
