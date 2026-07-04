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
