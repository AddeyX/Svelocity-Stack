import { describe, expect, it } from 'vitest';
import { parseClientEnv } from './index.js';

describe('parseClientEnv', () => {
	it('accepts a valid https Convex URL', () => {
		const env = parseClientEnv({ PUBLIC_CONVEX_URL: 'https://happy-otter-123.convex.cloud' });
		expect(env.PUBLIC_CONVEX_URL).toBe('https://happy-otter-123.convex.cloud');
	});

	it('accepts localhost in dev', () => {
		expect(() => parseClientEnv({ PUBLIC_CONVEX_URL: 'http://localhost:3210' })).not.toThrow();
	});

	it('rejects missing URL with a readable message', () => {
		expect(() => parseClientEnv({})).toThrow(/PUBLIC_CONVEX_URL/);
	});

	it('rejects plain-http non-localhost URLs', () => {
		expect(() => parseClientEnv({ PUBLIC_CONVEX_URL: 'http://example.com' })).toThrow(/https/);
	});
});
