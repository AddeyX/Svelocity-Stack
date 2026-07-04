import { findProjectRoot } from '../../lib/manifest.js';
import { colors, glyph } from '../../lib/output.js';
import {
	checkAuth,
	checkConvex,
	checkEnvironment,
	checkManifest,
	checkNativeTooling,
	checkTargets,
	checkWorkspace,
	type CheckResult
} from './checks.js';

export async function runDoctor(cwd: string): Promise<number> {
	const root = findProjectRoot(cwd);
	if (!root) {
		console.error(`${glyph('fail')} not inside a Svelocity project (no .svelocity/manifest.json found walking up from ${cwd})`);
		return 1;
	}
	console.log(`${colors.bold('svelocity doctor')} ${colors.dim(root)}\n`);

	const { results: manifestResults, manifest } = checkManifest(root);
	const all: CheckResult[] = [
		...(await checkEnvironment()),
		...checkWorkspace(root),
		...manifestResults,
		...checkConvex(root),
		...checkAuth(root),
		...checkTargets(root, manifest),
		...(await checkNativeTooling())
	];

	let category = '';
	for (const r of all) {
		if (r.category !== category) {
			category = r.category;
			console.log(colors.bold(category));
		}
		console.log(`  ${glyph(r.status)} ${r.name} - ${r.message}`);
		if (r.fix && r.status !== 'pass') console.log(`      ${colors.dim(`fix: ${r.fix}`)}`);
	}

	const counts = { pass: 0, warn: 0, fail: 0 };
	for (const r of all) counts[r.status] += 1;
	console.log(
		`\n${colors.green(`${counts.pass} pass`)}, ${colors.yellow(`${counts.warn} warn`)}, ${colors.red(`${counts.fail} fail`)}`
	);
	return counts.fail > 0 ? 1 : 0;
}
