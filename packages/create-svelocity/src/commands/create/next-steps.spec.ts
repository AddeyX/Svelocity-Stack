import { describe, expect, it } from 'vitest';
import { nextSteps } from './next-steps.js';

describe('nextSteps', () => {
	it('always includes cd, convex, dev, and cap add guidance', () => {
		const text = nextSteps({ projectName: 'acme-app', convexNow: false });
		expect(text).toContain('cd acme-app');
		expect(text).toContain('pnpm --filter @svelocity/backend dev');
		expect(text).toContain('pnpm dev');
		expect(text).toContain('cap add ios');
		expect(text).toContain('pnpm doctor');
	});

	it('expands the convex walkthrough when convexNow', () => {
		const now = nextSteps({ projectName: 'acme-app', convexNow: true });
		expect(now).toContain('PUBLIC_CONVEX_URL');
		expect(now).toContain('.env.local');
	});
});
