import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { targetDirProblem } from './target-dir.js';

describe('targetDirProblem', () => {
	const base = mkdtempSync(join(tmpdir(), 'sv-target-'));

	it('accepts a missing path', () => {
		expect(targetDirProblem(join(base, 'nope'), 'nope')).toBeUndefined();
	});

	it('accepts an empty directory', () => {
		const dir = join(base, 'empty');
		mkdirSync(dir);
		expect(targetDirProblem(dir, 'empty')).toBeUndefined();
	});

	it('rejects a non-empty directory', () => {
		const dir = join(base, 'full');
		mkdirSync(dir);
		writeFileSync(join(dir, 'file.txt'), 'x');
		expect(targetDirProblem(dir, 'full')).toContain('not empty');
	});

	it('rejects a path that exists but is a file', () => {
		const file = join(base, 'a-file');
		writeFileSync(file, 'x');
		expect(targetDirProblem(file, 'a-file')).toContain('not a directory');
	});
});
