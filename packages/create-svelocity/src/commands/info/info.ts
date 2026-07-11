import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Manifest } from '../../lib/manifest.js';
import { colors } from '../../lib/output.js';

const TARGET_DIRS: Record<string, string> = {
	web: 'apps/web',
	desktop: 'apps/desktop',
	mobile: 'apps/mobile'
};

const DEV_COMMANDS: Record<string, string> = {
	web: 'pnpm dev',
	desktop: 'pnpm dev:desktop',
	mobile: 'pnpm dev:mobile'
};

function hasBuildScript(pkgPath: string): boolean {
	if (!existsSync(pkgPath)) return false;
	try {
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
			scripts?: Record<string, string>;
		};
		return typeof pkg.scripts?.build === 'string' && pkg.scripts.build.length > 0;
	} catch {
		return false;
	}
}

function targetLine(root: string, target: string): string {
	const rel = TARGET_DIRS[target];
	if (!rel) return `    ${target.padEnd(9)}(unknown target)`;
	const dirOk = existsSync(join(root, rel));
	const buildOk = dirOk && hasBuildScript(join(root, rel, 'package.json'));
	const dir = dirOk ? 'dir ok' : 'dir missing';
	const build = buildOk ? 'build script ok' : 'build script missing';
	return `    ${target.padEnd(9)}${rel.padEnd(14)}${dir}, ${build}`;
}

function skillLine(root: string, name: string): string {
	const rel = `.agents/skills/${name}/SKILL.md`;
	const status = existsSync(join(root, rel)) ? 'ok' : `missing (${rel})`;
	return `    ${name.padEnd(28)}${status}`;
}

export function renderInfo(manifest: Manifest, root: string): string {
	const list = (items: string[]) => (items.length > 0 ? items.join(', ') : '(none)');
	const targetLines =
		manifest.targets.length > 0 ? manifest.targets.map((t) => targetLine(root, t)) : ['    (none)'];
	const skillLines =
		manifest.skills.length > 0 ? manifest.skills.map((s) => skillLine(root, s)) : ['    (none)'];
	const devLines = [
		...manifest.targets.flatMap((t) => {
			const cmd = DEV_COMMANDS[t];
			return cmd ? [`    ${t.padEnd(9)}${cmd}`] : [];
		}),
		`    ${'backend'.padEnd(9)}pnpm dev:backend`
	];
	return [
		colors.bold('Svelocity project'),
		'',
		`  stack version    ${manifest.stackVersion}`,
		`  created with     ${manifest.createdWith}`,
		`  ui               ${manifest.ui}`,
		`  auth             ${manifest.auth}`,
		`  backend          ${manifest.backend}`,
		`  package manager  ${manifest.packageManager}`,
		`  ai targets       ${list(manifest.aiTargets)}`,
		'',
		'  targets',
		...targetLines,
		'',
		'  skills',
		...skillLines,
		'',
		'  dev commands',
		...devLines,
		'',
		'  version pins: pnpm-workspace.yaml (catalog) - rationale in docs/COMPATIBILITY.md'
	].join('\n');
}
