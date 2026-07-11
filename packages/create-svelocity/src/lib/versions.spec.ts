import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	MIN_NODE,
	MIN_PNPM,
	parseEngineMinimum,
	parseMajor,
	readEngines,
	satisfiesMin
} from './versions.js';

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

describe('parseEngineMinimum', () => {
	it('extracts the minimum major from common range shapes', () => {
		expect(parseEngineMinimum('>=22')).toBe(22);
		expect(parseEngineMinimum('>= 22.12 <23')).toBe(22);
		expect(parseEngineMinimum('^22.1.0')).toBe(22);
		expect(parseEngineMinimum('22.x')).toBe(22);
		expect(parseEngineMinimum('~10.5.0')).toBe(10);
	});

	it('returns null for non-strings and digitless ranges', () => {
		expect(parseEngineMinimum(undefined)).toBeNull();
		expect(parseEngineMinimum(22)).toBeNull();
		expect(parseEngineMinimum('*')).toBeNull();
		expect(parseEngineMinimum('')).toBeNull();
	});
});

describe('readEngines', () => {
	it('reads node/pnpm minimums from package.json engines', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-engines-'));
		writeFileSync(join(root, 'package.json'), '{"engines":{"node":">=24","pnpm":">=11"}}');
		expect(readEngines(root)).toEqual({ node: 24, pnpm: 11, fromEngines: true });
	});

	it('falls back per field when one engine is missing', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-engines-'));
		writeFileSync(join(root, 'package.json'), '{"engines":{"node":">=24"}}');
		expect(readEngines(root)).toEqual({ node: 24, pnpm: MIN_PNPM, fromEngines: true });
	});

	it('falls back to stack defaults when engines are absent or unreadable', () => {
		const noEngines = mkdtempSync(join(tmpdir(), 'sv-engines-'));
		writeFileSync(join(noEngines, 'package.json'), '{"name":"x"}');
		expect(readEngines(noEngines)).toEqual({
			node: MIN_NODE,
			pnpm: MIN_PNPM,
			fromEngines: false
		});

		const broken = mkdtempSync(join(tmpdir(), 'sv-engines-'));
		writeFileSync(join(broken, 'package.json'), 'not json');
		expect(readEngines(broken)).toEqual({ node: MIN_NODE, pnpm: MIN_PNPM, fromEngines: false });

		const missing = mkdtempSync(join(tmpdir(), 'sv-engines-'));
		expect(readEngines(missing)).toEqual({ node: MIN_NODE, pnpm: MIN_PNPM, fromEngines: false });
	});

	it('treats unparseable ranges as absent', () => {
		const root = mkdtempSync(join(tmpdir(), 'sv-engines-'));
		writeFileSync(join(root, 'package.json'), '{"engines":{"node":"*","pnpm":">=11"}}');
		expect(readEngines(root)).toEqual({ node: MIN_NODE, pnpm: 11, fromEngines: true });
	});
});
