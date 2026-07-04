import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkConvex, checkTargets, checkWorkspace } from './checks.js';

function makeProject(): string {
	const root = mkdtempSync(join(tmpdir(), 'sv-doctor-'));
	writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n  - packages/*\n');
	for (const dir of ['apps/web', 'apps/desktop', 'apps/mobile', 'packages/backend/convex', '.svelocity']) {
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
