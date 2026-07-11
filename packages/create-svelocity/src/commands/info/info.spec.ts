import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
	aiTargets: ['agents-md'],
	skills: ['svelocity-convex', 'svelocity-auth']
};

function makeRoot(): string {
	const root = mkdtempSync(join(tmpdir(), 'sv-info-'));
	mkdirSync(join(root, 'apps/web'), { recursive: true });
	writeFileSync(join(root, 'apps/web/package.json'), '{"scripts":{"build":"vite build"}}');
	mkdirSync(join(root, 'apps/desktop'), { recursive: true });
	writeFileSync(join(root, 'apps/desktop/package.json'), '{"scripts":{"dev":"vite"}}');
	mkdirSync(join(root, '.agents/skills/svelocity-convex'), { recursive: true });
	writeFileSync(join(root, '.agents/skills/svelocity-convex/SKILL.md'), '# skill');
	return root;
}

describe('renderInfo', () => {
	it('renders every manifest field', () => {
		const text = renderInfo(manifest, makeRoot());
		expect(text).toContain('0.1.0');
		expect(text).toContain('create-svelocity@0.1.0');
		expect(text).toContain('bits-ui');
		expect(text).toContain('convex-auth');
		expect(text).toContain('pnpm@10.33.2');
		expect(text).toContain('agents-md');
		expect(text).toContain('docs/COMPATIBILITY.md');
	});

	it('reports per-target dir and build script status', () => {
		const text = renderInfo(manifest, makeRoot());
		expect(text).toMatch(/web\s+apps\/web\s+dir ok, build script ok/);
		expect(text).toMatch(/desktop\s+apps\/desktop\s+dir ok, build script missing/);
		expect(text).toMatch(/mobile\s+apps\/mobile\s+dir missing, build script missing/);
	});

	it('marks skills present or missing by SKILL.md existence', () => {
		const text = renderInfo(manifest, makeRoot());
		expect(text).toMatch(/svelocity-convex\s+ok/);
		expect(text).toMatch(
			/svelocity-auth\s+missing \(\.agents\/skills\/svelocity-auth\/SKILL\.md\)/
		);
	});

	it('lists dev commands per configured target plus backend', () => {
		const text = renderInfo(manifest, makeRoot());
		expect(text).toContain('pnpm dev');
		expect(text).toContain('pnpm dev:desktop');
		expect(text).toContain('pnpm dev:mobile');
		expect(text).toContain('pnpm dev:backend');

		const webOnly = renderInfo({ ...manifest, targets: ['web'] }, makeRoot());
		expect(webOnly).not.toContain('pnpm dev:desktop');
		expect(webOnly).not.toContain('pnpm dev:mobile');
		expect(webOnly).toContain('pnpm dev:backend');
	});

	it('renders (none) for empty lists', () => {
		const text = renderInfo({ ...manifest, targets: [], skills: [], aiTargets: [] }, makeRoot());
		expect(text).toContain('(none)');
	});
});
