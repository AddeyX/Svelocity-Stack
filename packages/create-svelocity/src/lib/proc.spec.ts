import { describe, expect, it } from 'vitest';
import { commandVersion, run } from './proc.js';

describe('run', () => {
	it('resolves with exit code and stdout', async () => {
		const result = await run('node', ['-e', 'console.log("hi")']);
		expect(result.code).toBe(0);
		expect(result.stdout).toBe('hi');
	});

	it('resolves (never rejects) when the command does not exist', async () => {
		const result = await run('definitely-not-a-real-command-xyz', ['--version']);
		expect(result.code).not.toBe(0);
		expect(result.stdout).toBe('');
	});
});

describe('commandVersion', () => {
	it('returns null for a missing command', async () => {
		expect(await commandVersion('definitely-not-a-real-command-xyz')).toBeNull();
	});

	it('returns a version string for node', async () => {
		expect(await commandVersion('node')).toMatch(/\d+\./);
	});
});
