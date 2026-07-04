import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cliVersion, pkgRoot } from './pkg.js';

describe('pkg', () => {
	it('resolves the create-svelocity package root and version', () => {
		const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as {
			name: string;
			version: string;
		};
		expect(pkg.name).toBe('create-svelocity');
		expect(cliVersion).toBe(pkg.version);
	});
});
