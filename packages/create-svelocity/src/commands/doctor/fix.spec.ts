import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyFixes } from './fix.js';

function makeRoot(): string {
	const root = mkdtempSync(join(tmpdir(), 'sv-fix-'));
	mkdirSync(join(root, 'apps/web'), { recursive: true });
	return root;
}

const EXAMPLE = 'PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud\n';

describe('applyFixes', () => {
	it('copies .env.example to .env.local when the url is unset', () => {
		const root = makeRoot();
		writeFileSync(join(root, 'apps/web/.env.example'), EXAMPLE);
		const fixes = applyFixes(root);
		expect(fixes).toHaveLength(1);
		expect(fixes[0]?.name).toBe('PUBLIC_CONVEX_URL');
		expect(readFileSync(join(root, 'apps/web/.env.local'), 'utf8')).toBe(EXAMPLE);
		// idempotent: the copied file now sets the url, so nothing left to fix
		expect(applyFixes(root)).toEqual([]);
	});

	it('does nothing without an .env.example', () => {
		const root = makeRoot();
		expect(applyFixes(root)).toEqual([]);
		expect(existsSync(join(root, 'apps/web/.env.local'))).toBe(false);
	});

	it('never overwrites an existing .env.local', () => {
		const root = makeRoot();
		writeFileSync(join(root, 'apps/web/.env.example'), EXAMPLE);
		writeFileSync(join(root, 'apps/web/.env.local'), '# PUBLIC_CONVEX_URL=\n');
		expect(applyFixes(root)).toEqual([]);
		expect(readFileSync(join(root, 'apps/web/.env.local'), 'utf8')).toBe('# PUBLIC_CONVEX_URL=\n');
	});

	it('does nothing when another env file already sets the url', () => {
		const root = makeRoot();
		writeFileSync(join(root, 'apps/web/.env.example'), EXAMPLE);
		writeFileSync(join(root, '.env'), 'PUBLIC_CONVEX_URL=http://127.0.0.1:3210\n');
		expect(applyFixes(root)).toEqual([]);
		expect(existsSync(join(root, 'apps/web/.env.local'))).toBe(false);
	});
});
