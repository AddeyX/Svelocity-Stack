#!/usr/bin/env node
/**
 * npm pack / npm publish do not rewrite pnpm catalog: or workspace: specifiers.
 * prepack rewrites this package's own package.json for the tarball, and postpack
 * restores the working tree. Manifests inside template/ are left alone.
 */
import {
	copyFileSync,
	existsSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(pkgRoot, '../..');
const pkgPath = join(pkgRoot, 'package.json');
const backupPath = join(tmpdir(), 'create-svelocity-package.json.bak');

const DEPENDENCY_FIELDS = [
	'dependencies',
	'devDependencies',
	'optionalDependencies',
	'peerDependencies'
];

export function parseDefaultCatalog(yaml) {
	const catalog = {};
	let inCatalog = false;
	for (const line of yaml.split(/\r?\n/)) {
		if (!inCatalog) {
			if (/^catalog:\s*(?:#.*)?$/.test(line)) inCatalog = true;
			continue;
		}
		if (/^\S/.test(line)) break;
		const trimmed = line.trim();
		if (trimmed === '' || trimmed.startsWith('#')) continue;
		const match = trimmed.match(/^(?:'([^']+)'|"([^"]+)"|([^:\s]+))\s*:\s*(.+)$/);
		if (!match) throw new Error(`cannot parse catalog line: ${line}`);
		const name = match[1] ?? match[2] ?? match[3];
		const valueMatch = match[4].trim().match(/^('(?:[^']*)'|"(?:[^"]*)"|\S+)(?:\s+#.*)?$/);
		if (!name || !valueMatch) throw new Error(`cannot parse catalog value: ${line}`);
		let value = valueMatch[1];
		if (
			(value.startsWith("'") && value.endsWith("'")) ||
			(value.startsWith('"') && value.endsWith('"'))
		) {
			value = value.slice(1, -1);
		}
		catalog[name] = value;
	}
	if (!inCatalog) throw new Error('pnpm-workspace.yaml has no default catalog');
	return catalog;
}

export function rewriteManifest(manifest, catalog, workspacePackages) {
	const next = structuredClone(manifest);
	for (const field of DEPENDENCY_FIELDS) {
		const block = next[field];
		if (!block) continue;
		for (const [name, spec] of Object.entries(block)) {
			if (typeof spec !== 'string') {
				throw new Error(`${field}.${name} is not a string specifier`);
			}
			if (spec === 'catalog:') {
				const pin = catalog[name];
				if (typeof pin !== 'string' || pin.length === 0) {
					throw new Error(`default catalog has no pin for ${name}`);
				}
				if (pin.includes('catalog:') || pin.includes('workspace:')) {
					throw new Error(`catalog pin for ${name} is not a registry specifier`);
				}
				block[name] = pin;
				continue;
			}
			if (spec.startsWith('catalog:')) {
				throw new Error(
					`${field}.${name} uses ${spec}; only the default catalog: protocol is rewritten`
				);
			}
			if (spec.startsWith('workspace:')) {
				if (workspacePackages.get(name)?.private === true) {
					delete block[name];
					continue;
				}
				throw new Error(`${field}.${name} uses ${spec} and is not a private workspace package`);
			}
		}
	}
	return next;
}

export function loadDefaultCatalog(root = repoRoot) {
	return parseDefaultCatalog(readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8'));
}

export function loadWorkspacePackages(root = repoRoot) {
	const packages = new Map();
	for (const dir of ['packages', 'apps']) {
		const base = join(root, dir);
		if (!existsSync(base)) continue;
		for (const name of readdirSync(base)) {
			const manifestPath = join(base, name, 'package.json');
			if (!existsSync(manifestPath)) continue;
			const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
			if (typeof manifest.name === 'string') {
				packages.set(manifest.name, { private: manifest.private === true });
			}
		}
	}
	return packages;
}

export function prepack() {
	copyFileSync(pkgPath, backupPath);
	try {
		const manifest = JSON.parse(readFileSync(pkgPath, 'utf8'));
		const rewritten = rewriteManifest(manifest, loadDefaultCatalog(), loadWorkspacePackages());
		writeFileSync(pkgPath, `${JSON.stringify(rewritten, null, '\t')}\n`);
	} catch (error) {
		copyFileSync(backupPath, pkgPath);
		rmSync(backupPath, { force: true });
		throw error;
	}
}

export function postpack() {
	if (!existsSync(backupPath)) {
		throw new Error(`pack backup missing at ${backupPath}`);
	}
	copyFileSync(backupPath, pkgPath);
	rmSync(backupPath, { force: true });
}

function invokedDirectly() {
	const entry = process.argv[1];
	return entry !== undefined && resolve(entry) === fileURLToPath(import.meta.url);
}

if (invokedDirectly()) {
	const command = process.argv[2];
	if (command === 'prepack') prepack();
	else if (command === 'postpack') postpack();
	else {
		console.error('usage: node scripts/pack-manifest.mjs <prepack|postpack>');
		process.exit(1);
	}
}
