import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function findPackageRoot(from: string): string {
	let dir = dirname(from);
	while (!existsSync(join(dir, 'package.json'))) {
		const parent = dirname(dir);
		if (parent === dir) throw new Error('create-svelocity package.json not found');
		dir = parent;
	}
	return dir;
}

export const pkgRoot = findPackageRoot(fileURLToPath(import.meta.url));

export const cliVersion = (
	JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as { version: string }
).version;
