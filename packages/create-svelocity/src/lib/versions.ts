import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const MIN_NODE = 22;
export const MIN_PNPM = 10;

export function parseMajor(version: string): number | null {
	const match = /^v?(\d+)\./.exec(version.trim());
	return match ? Number(match[1]) : null;
}

export function satisfiesMin(version: string, minMajor: number): boolean {
	const major = parseMajor(version);
	return major !== null && major >= minMajor;
}

/** Minimum major from an engines range like ">=22", "^22.1.0", "22.x". */
export function parseEngineMinimum(range: unknown): number | null {
	if (typeof range !== 'string') return null;
	const match = /(\d+)/.exec(range);
	return match ? Number(match[1]) : null;
}

export interface EngineMinimums {
	node: number;
	pnpm: number;
	fromEngines: boolean;
}

/**
 * Read minimum majors from the project root package.json "engines" field,
 * falling back to MIN_NODE/MIN_PNPM when absent or unparseable. This makes
 * doctor enforce the matrix the project records (docs/COMPATIBILITY.md
 * mirrors engines).
 */
export function readEngines(root: string): EngineMinimums {
	let engines: { node?: unknown; pnpm?: unknown } | undefined;
	try {
		const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
			engines?: { node?: unknown; pnpm?: unknown };
		};
		engines = pkg.engines;
	} catch {
		engines = undefined;
	}
	const node = parseEngineMinimum(engines?.node);
	const pnpm = parseEngineMinimum(engines?.pnpm);
	return {
		node: node ?? MIN_NODE,
		pnpm: pnpm ?? MIN_PNPM,
		fromEngines: node !== null || pnpm !== null
	};
}
