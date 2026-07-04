#!/usr/bin/env node
/** Remove build artifacts across the workspace. Never touches node_modules or native dirs. */
import { rmSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifactDirs = ['dist', 'build', '.svelte-kit', '.vite', 'coverage', 'test-results'];

const workspaces = ['apps', 'packages']
	.flatMap((group) => {
		const dir = join(root, group);
		return existsSync(dir)
			? readdirSync(dir, { withFileTypes: true })
					.filter((d) => d.isDirectory())
					.map((d) => join(dir, d.name))
			: [];
	})
	.concat(root);

for (const ws of workspaces) {
	for (const artifact of artifactDirs) {
		const target = join(ws, artifact);
		if (existsSync(target)) {
			rmSync(target, { recursive: true, force: true });
			console.log(`removed ${target.replace(root + '/', '')}`);
		}
	}
}
