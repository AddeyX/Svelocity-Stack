import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	checkAuth,
	checkConvex,
	checkEnvironment,
	checkManifest,
	checkTargets,
	checkWorkspace,
	envSetsConvexUrl
} from './checks.js';

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
	writeFileSync(
		join(root, 'apps/desktop/package.json'),
		'{"devDependencies":{"electron":"^38.0.0"}}'
	);
	writeFileSync(
		join(root, 'packages/backend/package.json'),
		'{"dependencies":{"convex":"^1.0.0"}}'
	);
	return root;
}

function makeHealthyProject(): string {
	const root = makeProject();
	writeFileSync(join(root, '.svelocity/manifest.json'), JSON.stringify(manifest));
	writeFileSync(join(root, 'apps/web/.env.local'), 'PUBLIC_CONVEX_URL=http://127.0.0.1:3210\n');
	writeFileSync(join(root, 'packages/backend/convex/auth.ts'), 'export {};');
	writeFileSync(join(root, 'packages/backend/convex/auth.config.ts'), 'export {};');
	mkdirSync(join(root, 'apps/mobile/ios'), { recursive: true });
	mkdirSync(join(root, 'apps/mobile/android'), { recursive: true });
	return root;
}

describe('healthy project', () => {
	it('passes every static check', async () => {
		const root = makeHealthyProject();
		const { results: manifestResults, manifest: read } = checkManifest(root);
		const all = [
			...(await checkEnvironment(root)),
			...checkWorkspace(root),
			...manifestResults,
			...checkConvex(root),
			...checkAuth(root),
			...checkTargets(root, read)
		];
		expect(all.filter((r) => r.status !== 'pass')).toEqual([]);
	});
});

describe('fix suggestions', () => {
	it('every non-pass result carries a fix string', async () => {
		const bare = mkdtempSync(join(tmpdir(), 'sv-broken-'));
		writeFileSync(join(bare, 'package.json'), '{"engines":{"node":">=999","pnpm":">=999"}}');
		const { results: manifestResults, manifest: read } = checkManifest(bare);
		const all = [
			...(await checkEnvironment(bare)),
			...checkWorkspace(bare),
			...manifestResults,
			...checkConvex(bare),
			...checkAuth(bare),
			...checkTargets(bare, read)
		];
		const broken = all.filter((r) => r.status !== 'pass');
		expect(broken.length).toBeGreaterThan(0);
		for (const r of broken) {
			expect(r.fix, `${r.category}/${r.name} should carry a fix`).toBeTruthy();
		}
	});
});

describe('checkEnvironment', () => {
	it('respects package.json engines overrides', async () => {
		const strict = mkdtempSync(join(tmpdir(), 'sv-env-'));
		writeFileSync(join(strict, 'package.json'), '{"engines":{"node":">=999"}}');
		const results = await checkEnvironment(strict);
		const node = results.find((r) => r.name === 'node');
		expect(node?.status).toBe('fail');
		expect(node?.message).toContain('required 999');
		expect(node?.message).toContain('package.json engines');
		expect(node?.fix).toContain('999');

		const loose = mkdtempSync(join(tmpdir(), 'sv-env-'));
		writeFileSync(join(loose, 'package.json'), '{"engines":{"node":">=1","pnpm":">=1"}}');
		const looseResults = await checkEnvironment(loose);
		expect(looseResults.find((r) => r.name === 'node')?.status).toBe('pass');
	});

	it('falls back to stack defaults without engines', async () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-env-'));
		const node = (await checkEnvironment(root)).find((r) => r.name === 'node');
		// this repo runs on Node 22+, the stack default minimum
		expect(node?.status).toBe('pass');
	});
});

describe('checkWorkspace', () => {
	it('passes on a complete workspace and fails on a bare dir', () => {
		expect(checkWorkspace(makeProject()).every((r) => r.status === 'pass')).toBe(true);
		const bare = mkdtempSync(join(tmpdir(), 'sv-bare-'));
		const failed = checkWorkspace(bare).filter((r) => r.status === 'fail');
		expect(failed.length).toBe(3);
		for (const r of failed) expect(r.fix).toBeTruthy();
	});
});

describe('checkManifest', () => {
	it('fails with a fix when the manifest is missing', () => {
		const bare = mkdtempSync(join(tmpdir(), 'sv-nomanifest-'));
		const { results, manifest: read } = checkManifest(bare);
		expect(read).toBeNull();
		expect(results[0]?.status).toBe('fail');
		expect(results[0]?.fix).toContain('create-svelocity');
	});

	it('fails with a fix when the manifest violates its schema', () => {
		const root = makeProject();
		writeFileSync(join(root, '.svelocity/manifest.json'), '{"stackVersion":"0.1.0"}');
		writeFileSync(
			join(root, '.svelocity/manifest.schema.json'),
			'{"type":"object","required":["stackVersion","targets"]}'
		);
		const { results } = checkManifest(root);
		expect(results[0]?.status).toBe('fail');
		expect(results[0]?.message).toContain('targets');
		expect(results[0]?.fix).toContain('manifest.schema.json');
	});
});

describe('checkConvex', () => {
	it('fails without convex dir, warns without env', () => {
		const root = makeProject();
		const results = checkConvex(root);
		expect(results.find((r) => r.name === 'convex directory')?.status).toBe('pass');
		expect(results.find((r) => r.name === 'convex cli dependency')?.status).toBe('pass');
		const env = results.find((r) => r.name === 'PUBLIC_CONVEX_URL');
		expect(env?.status).toBe('warn');
		expect(env?.fix).toContain('.env.example');

		const bare = mkdtempSync(join(tmpdir(), 'sv-noconvex-'));
		const dir = checkConvex(bare).find((r) => r.name === 'convex directory');
		expect(dir?.status).toBe('fail');
		expect(dir?.fix).toBeTruthy();
	});

	it('passes env check when .env.local sets PUBLIC_CONVEX_URL', () => {
		const root = makeProject();
		writeFileSync(join(root, 'apps/web/.env.local'), 'PUBLIC_CONVEX_URL=http://127.0.0.1:3210\n');
		expect(envSetsConvexUrl(root)).toBe(true);
		expect(checkConvex(root).find((r) => r.name === 'PUBLIC_CONVEX_URL')?.status).toBe('pass');
	});

	it('warns when PUBLIC_CONVEX_URL is only a commented-out line', () => {
		const root = makeProject();
		writeFileSync(join(root, 'apps/web/.env.local'), '# PUBLIC_CONVEX_URL=\n');
		expect(envSetsConvexUrl(root)).toBe(false);
		expect(checkConvex(root).find((r) => r.name === 'PUBLIC_CONVEX_URL')?.status).toBe('warn');
	});

	it('treats an unreadable env path as not set instead of crashing', () => {
		const root = makeProject();
		// a directory named like an env file: existsSync true, readFileSync throws
		mkdirSync(join(root, 'apps/web/.env.local'), { recursive: true });
		expect(envSetsConvexUrl(root)).toBe(false);
		expect(checkConvex(root).find((r) => r.name === 'PUBLIC_CONVEX_URL')?.status).toBe('warn');
	});

	it('notes the copy and keeps a warn after --fix copied the env file', () => {
		const root = makeProject();
		writeFileSync(join(root, 'apps/web/.env.local'), 'PUBLIC_CONVEX_URL=https://x.convex.cloud\n');
		const env = checkConvex(root, { envFileCopied: true }).find(
			(r) => r.name === 'PUBLIC_CONVEX_URL'
		);
		expect(env?.status).toBe('warn');
		expect(env?.message).toContain('.env.example');
		expect(env?.fix).toContain('apps/web/.env.local');
	});

	it('does not treat a "convex" script as the cli dependency', () => {
		const root = makeProject();
		writeFileSync(
			join(root, 'packages/backend/package.json'),
			'{"scripts":{"convex":"convex dev"},"dependencies":{}}'
		);
		expect(checkConvex(root).find((r) => r.name === 'convex cli dependency')?.status).toBe('warn');
	});
});

describe('checkAuth', () => {
	it('warns with a fix when auth files are missing', () => {
		const root = makeProject();
		const auth = checkAuth(root)[0];
		expect(auth?.status).toBe('warn');
		expect(auth?.fix).toContain('svelocity-auth');
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

	it('fails with fixes when manifest target directories are missing', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-notargets-'));
		const results = checkTargets(root, manifest);
		const failed = results.filter((r) => r.status === 'fail');
		expect(failed.length).toBeGreaterThan(0);
		for (const r of failed) expect(r.fix).toBeTruthy();
	});
});
