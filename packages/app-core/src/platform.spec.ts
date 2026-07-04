import { describe, expect, it } from 'vitest';
import { isPlatform } from './platform.js';

describe('isPlatform', () => {
	it('accepts the three golden-path platforms', () => {
		expect(isPlatform('web')).toBe(true);
		expect(isPlatform('desktop')).toBe(true);
		expect(isPlatform('mobile')).toBe(true);
	});

	it('rejects anything else', () => {
		expect(isPlatform('watch')).toBe(false);
		expect(isPlatform('')).toBe(false);
		expect(isPlatform(undefined)).toBe(false);
		expect(isPlatform(42)).toBe(false);
	});
});
