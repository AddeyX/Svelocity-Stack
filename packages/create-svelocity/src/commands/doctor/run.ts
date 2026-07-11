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
import { applyFixes, type AppliedFix } from './fix.js';

export interface DoctorOptions {
	json?: boolean;
	fix?: boolean;
}

export interface DoctorReport {
	root: string;
	results: CheckResult[];
	summary: { pass: number; warn: number; fail: number };
	fixes?: AppliedFix[];
}

export async function collectDoctorReport(
	root: string,
	opts: { fix?: boolean } = {}
): Promise<DoctorReport> {
	const fixes = opts.fix ? applyFixes(root) : [];
	const envFileCopied = fixes.some((f) => f.name === 'PUBLIC_CONVEX_URL');
	const { results: manifestResults, manifest } = checkManifest(root);
	const results: CheckResult[] = [
		...(await checkEnvironment(root)),
		...checkWorkspace(root),
		...manifestResults,
		...checkConvex(root, { envFileCopied }),
		...checkAuth(root),
		...checkTargets(root, manifest),
		...(await checkNativeTooling())
	];
	const summary = { pass: 0, warn: 0, fail: 0 };
	for (const r of results) summary[r.status] += 1;
	const report: DoctorReport = { root, results, summary };
	if (opts.fix) report.fixes = fixes;
	return report;
}

export async function runDoctor(cwd: string, options: DoctorOptions = {}): Promise<number> {
	const root = findProjectRoot(cwd);
	if (!root) {
		const message = `not inside a Svelocity project (no .svelocity/manifest.json found walking up from ${cwd})`;
		console.error(options.json ? message : `${glyph('fail')} ${message}`);
		return 1;
	}

	const report = await collectDoctorReport(root, { fix: options.fix });

	if (options.json) {
		console.log(JSON.stringify(report, null, 2));
		return report.summary.fail > 0 ? 1 : 0;
	}

	console.log(`${colors.bold('svelocity doctor')} ${colors.dim(root)}\n`);

	if (options.fix) {
		if (report.fixes && report.fixes.length > 0) {
			for (const fix of report.fixes) {
				console.log(`${glyph('pass')} fixed ${fix.name}: ${fix.detail}`);
			}
		} else {
			console.log(colors.dim('no auto-fixes applied'));
		}
		console.log('');
	}

	let category = '';
	for (const r of report.results) {
		if (r.category !== category) {
			category = r.category;
			console.log(colors.bold(category));
		}
		console.log(`  ${glyph(r.status)} ${r.name} - ${r.message}`);
		if (r.fix && r.status !== 'pass') console.log(`      ${colors.dim(`fix: ${r.fix}`)}`);
	}

	const { pass, warn, fail } = report.summary;
	console.log(
		`\n${colors.green(`${pass} pass`)}, ${colors.yellow(`${warn} warn`)}, ${colors.red(`${fail} fail`)}`
	);
	return fail > 0 ? 1 : 0;
}
