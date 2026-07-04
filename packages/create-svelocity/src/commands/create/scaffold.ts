import { cpSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { replaceTokens, type TokenMap } from '../../lib/tokens.js';

const TEXT_EXTENSIONS = new Set([
	'.ts',
	'.js',
	'.mjs',
	'.cjs',
	'.svelte',
	'.json',
	'.jsonc',
	'.md',
	'.html',
	'.css',
	'.yaml',
	'.yml',
	'.xml',
	'.txt',
	'.example',
	'.gradle',
	'.java',
	'.plist'
]);

const DOTFILE_RESTORES = new Map([
	['_gitignore', '.gitignore'],
	['_npmrc', '.npmrc']
]);

export function scaffold(templateDir: string, targetDir: string, tokens: TokenMap): void {
	cpSync(templateDir, targetDir, { recursive: true });
	walk(targetDir, tokens);
}

function walk(dir: string, tokens: TokenMap): void {
	for (const entry of readdirSync(dir)) {
		let full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			walk(full, tokens);
			continue;
		}

		const restored = DOTFILE_RESTORES.get(entry);
		if (restored) {
			const dest = join(dir, restored);
			renameSync(full, dest);
			full = dest;
		}

		const name = restored ?? entry;
		if (!TEXT_EXTENSIONS.has(extname(name)) && !name.startsWith('.')) continue;

		const content = readFileSync(full, 'utf8');
		if (!content.includes('{{')) continue;
		writeFileSync(full, replaceTokens(content, tokens));
	}
}
