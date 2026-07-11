import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { collectDoctorReport, runDoctor, type DoctorReport } from './run.js';

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

function makeHealthyProject(): string {
	const root = mkdtempSync(join(tmpdir(), 'sv-run-'));
	writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n  - packages/*\n');
	for (const dir of ['apps/web', 'apps/desktop', 'apps/mobile', 'packages/backend/convex']) {
		mkdirSync(join(root, dir), { recursive: true });
	}
	mkdirSync(join(root, '.svelocity'), { recursive: true });
	writeFileSync(join(root, '.svelocity/manifest.json'), JSON.stringify(manifest));
	writeFileSync(join(root, 'apps/mobile/capacitor.config.ts'), "appId: 'com.acme.app'");
	mkdirSync(join(root, 'apps/mobile/ios'), { recursive: true });
	mkdirSync(join(root, 'apps/mobile/android'), { recursive: true });
	writeFileSync(
		join(root, 'apps/desktop/package.json'),
		'{"devDependencies":{"electron":"^38.0.0"}}'
	);
	writeFileSync(
		join(root, 'packages/backend/package.json'),
		'{"dependencies":{"convex":"^1.0.0"}}'
	);
	writeFileSync(join(root, 'apps/web/.env.local'), 'PUBLIC_CONVEX_URL=http://127.0.0.1:3210\n');
	writeFileSync(join(root, 'packages/backend/convex/auth.ts'), 'export {};');
	writeFileSync(join(root, 'packages/backend/convex/auth.config.ts'), 'export {};');
	return root;
}

const STATIC_CATEGORIES = ['workspace', 'manifest', 'convex', 'auth', 'targets'];

afterEach(() => {
	vi.restoreAllMocks();
});

describe('runDoctor --json', () => {
	it('prints a { root, results, summary } payload and exits 0 when healthy', async () => {
		const root = makeHealthyProject();
		const log = vi.spyOn(console, 'log').mockImplementation(() => {});
		const code = await runDoctor(root, { json: true });
		expect(code).toBe(0);
		expect(log).toHaveBeenCalledTimes(1);
		const payload = JSON.parse(log.mock.calls[0]?.[0] as string) as DoctorReport;
		expect(Object.keys(payload)).toEqual(['root', 'results', 'summary']);
		expect(payload.root).toBe(root);
		expect(Object.keys(payload.summary)).toEqual(['pass', 'warn', 'fail']);
		expect(payload.summary.pass + payload.summary.warn + payload.summary.fail).toBe(
			payload.results.length
		);
		expect(payload.summary.fail).toBe(0);
		for (const r of payload.results) {
			expect(typeof r.category).toBe('string');
			expect(typeof r.name).toBe('string');
			expect(typeof r.message).toBe('string');
			expect(['pass', 'warn', 'fail']).toContain(r.status);
		}
		// machine-dependent categories (environment, native tooling) excluded
		const deterministic = payload.results.filter((r) => STATIC_CATEGORIES.includes(r.category));
		expect(deterministic).toMatchSnapshot();
	});

	it('exits 1 when a check fails', async () => {
		const root = makeHealthyProject();
		rmSync(join(root, 'apps/web'), { recursive: true });
		vi.spyOn(console, 'log').mockImplementation(() => {});
		expect(await runDoctor(root, { json: true })).toBe(1);
	});

	it('exits 1 outside a project', async () => {
		const bare = mkdtempSync(join(tmpdir(), 'sv-run-bare-'));
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(await runDoctor(bare, { json: true })).toBe(1);
		expect(String(error.mock.calls[0]?.[0])).toContain('not inside a Svelocity project');
	});
});

describe('runDoctor --fix', () => {
	it('copies .env.example to .env.local, reports it, and notes it on the check', async () => {
		const root = makeHealthyProject();
		rmSync(join(root, 'apps/web/.env.local'));
		writeFileSync(
			join(root, 'apps/web/.env.example'),
			'PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud\n'
		);
		const report = await collectDoctorReport(root, { fix: true });
		expect(report.fixes).toHaveLength(1);
		expect(report.fixes?.[0]?.detail).toContain('.env.example');
		const env = report.results.find((r) => r.name === 'PUBLIC_CONVEX_URL');
		expect(env?.status).toBe('warn');
		expect(env?.message).toContain('.env.example');

		// the copy is on disk: the next plain run passes the env check
		const next = await collectDoctorReport(root, { fix: false });
		expect(next.results.find((r) => r.name === 'PUBLIC_CONVEX_URL')?.status).toBe('pass');
		expect(next.fixes).toBeUndefined();
	});

	it('includes an empty fixes array when nothing was fixable', async () => {
		const root = makeHealthyProject();
		const report = await collectDoctorReport(root, { fix: true });
		expect(report.fixes).toEqual([]);
	});
});
