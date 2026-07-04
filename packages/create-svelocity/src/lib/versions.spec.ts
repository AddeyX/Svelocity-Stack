import { describe, expect, it } from 'vitest';
import { parseMajor, satisfiesMin } from './versions.js';

describe('parseMajor', () => {
	it('parses plain and v-prefixed versions', () => {
		expect(parseMajor('22.1.0')).toBe(22);
		expect(parseMajor('v22.1.0')).toBe(22);
		expect(parseMajor('10.12.3')).toBe(10);
	});

	it('returns null for garbage', () => {
		expect(parseMajor('not-a-version')).toBeNull();
		expect(parseMajor('')).toBeNull();
	});
});

describe('satisfiesMin', () => {
	it('compares major versions', () => {
		expect(satisfiesMin('22.0.0', 22)).toBe(true);
		expect(satisfiesMin('23.1.0', 22)).toBe(true);
		expect(satisfiesMin('20.19.0', 22)).toBe(false);
		expect(satisfiesMin('garbage', 22)).toBe(false);
	});
});
