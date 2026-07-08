#!/usr/bin/env node
/**
 * Snapshot the repo root into packages/create-svelocity/template/.
 * The reference monorepo is the template; this script excludes stack-only
 * files, renames dotfiles npm strips, and injects {{TOKENS}}.
 */
import {
	cpSync,
	existsSync,
	mkdtempSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(pkgRoot, '../..');
const finalOut = process.env.TEMPLATE_OUT ?? join(pkgRoot, 'template');
const out = isInside(repoRoot, finalOut)
	? mkdtempSync(join(dirname(repoRoot), '.svelocity-template-'))
	: finalOut;

const EXCLUDE_DIR_NAMES = new Set([
	'node_modules',
	'.git',
	'.svelte-kit',
	'.wrangler',
	'.superpowers',
	'dist',
	'dist-electron',
	'release',
	'build',
	'coverage',
	'.claude',
	'.DS_Store'
]);

const EXCLUDE_PATHS = new Set([
	'packages/create-svelocity',
	'.github',
	'.svelocity/manifest.json',
	'apps/mobile/ios',
	'apps/mobile/android',
	'docs/phases',
	'docs/superpowers',
	'docs/V1-SCOPE.md',
	'docs/V1.1-BACKLOG.md',
	'docs/RISKS.md',
	'docs/Svelocity-Stack-PR.md',
	'docs/CONTRIBUTING-STACK.md',
	'README.md',
	'LICENSE'
]);

const DOTFILE_RENAMES = new Map([
	['.gitignore', '_gitignore'],
	['.npmrc', '_npmrc']
]);

const TOKENIZE = [
	['package.json', [['"name": "svelocity-stack"', '"name": "{{PROJECT_NAME}}"']]],
	[
		'apps/mobile/capacitor.config.ts',
		[
			['dev.svelocity.tasks', '{{APP_ID}}'],
			['Shared Tasks', '{{DISPLAY_NAME}}']
		]
	],
	[
		'apps/desktop/electron-builder.json',
		[
			['dev.svelocity.tasks', '{{APP_ID}}'],
			['Shared Tasks', '{{DISPLAY_NAME}}']
		]
	],
	['AGENTS.md', [['# Svelocity Stack — Agent Guide', '# {{DISPLAY_NAME}} — Agent Guide']]]
];

function toPosix(path) {
	return path.split(sep).join('/');
}

function isInside(parent, child) {
	const rel = relative(parent, child);
	return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

function excluded(rel, name) {
	if (EXCLUDE_DIR_NAMES.has(name)) return true;
	if (EXCLUDE_PATHS.has(toPosix(rel))) return true;
	if (/^\.env(\..*)?$/.test(name) && name !== '.env.example') return true;
	return false;
}

function renameDotfiles(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			renameDotfiles(full);
			continue;
		}
		const renamed = DOTFILE_RENAMES.get(entry);
		if (renamed) renameSync(full, join(dir, renamed));
	}
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(repoRoot, out, {
	recursive: true,
	filter(src) {
		const rel = relative(repoRoot, src);
		if (rel === '') return true;
		const name = rel.split(sep).at(-1);
		return !excluded(rel, name);
	}
});

renameDotfiles(out);

for (const [rel, pairs] of TOKENIZE) {
	const file = join(out, rel);
	if (!existsSync(file)) {
		console.error(`x tokenize: ${rel} missing from template`);
		process.exit(1);
	}
	let content = readFileSync(file, 'utf8');
	for (const [search, replace] of pairs) {
		if (!content.includes(search)) {
			console.error(`x tokenize: ${rel} no longer contains ${JSON.stringify(search)}`);
			process.exit(1);
		}
		content = content.replaceAll(search, replace);
	}
	writeFileSync(file, content);
}

cpSync(join(pkgRoot, 'assets/README.template.md'), join(out, 'README.md'));

if (out !== finalOut) {
	rmSync(finalOut, { recursive: true, force: true });
	mkdirSync(dirname(finalOut), { recursive: true });
	renameSync(out, finalOut);
}

console.log(`template written to ${finalOut}`);
