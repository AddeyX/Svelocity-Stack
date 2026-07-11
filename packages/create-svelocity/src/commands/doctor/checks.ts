import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readManifest, type Manifest } from '../../lib/manifest.js';
import type { CheckStatus } from '../../lib/output.js';
import { commandVersion, run } from '../../lib/proc.js';
import { readEngines, satisfiesMin } from '../../lib/versions.js';

export interface CheckResult {
	category: string;
	name: string;
	status: CheckStatus;
	message: string;
	fix?: string;
}

const result = (
	category: string,
	name: string,
	status: CheckStatus,
	message: string,
	fix?: string
): CheckResult => ({ category, name, status, message, fix });

function pkgHasDep(pkgPath: string, dep: string): boolean {
	if (!existsSync(pkgPath)) return false;
	try {
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
		};
		return Boolean(pkg.dependencies?.[dep] ?? pkg.devDependencies?.[dep]);
	} catch {
		return false;
	}
}

export async function checkEnvironment(root: string): Promise<CheckResult[]> {
	const mins = readEngines(root);
	const source = mins.fromEngines ? 'package.json engines' : 'stack default';
	const results: CheckResult[] = [];
	results.push(
		satisfiesMin(process.version, mins.node)
			? result('environment', 'node', 'pass', process.version)
			: result(
					'environment',
					'node',
					'fail',
					`${process.version} < required ${mins.node} (${source})`,
					`install Node ${mins.node}+`
				)
	);
	const pnpm = await commandVersion('pnpm');
	if (!pnpm) {
		results.push(result('environment', 'pnpm', 'fail', 'not found', 'npm install -g pnpm'));
	} else {
		results.push(
			satisfiesMin(pnpm, mins.pnpm)
				? result('environment', 'pnpm', 'pass', pnpm)
				: result(
						'environment',
						'pnpm',
						'fail',
						`${pnpm} < required ${mins.pnpm} (${source})`,
						'npm install -g pnpm'
					)
		);
	}
	return results;
}

export function checkWorkspace(root: string): CheckResult[] {
	const entries: Array<[string, string, string]> = [
		[
			'pnpm-workspace.yaml',
			'pnpm-workspace.yaml',
			'restore pnpm-workspace.yaml (declares apps/* + packages/* and the version catalog)'
		],
		['apps directory', 'apps', 'restore apps/ from git history or re-run create-svelocity'],
		[
			'packages directory',
			'packages',
			'restore packages/ from git history or re-run create-svelocity'
		]
	];
	return entries.map(([name, rel, fix]) =>
		existsSync(join(root, rel))
			? result('workspace', name, 'pass', 'present')
			: result('workspace', name, 'fail', `${rel} missing`, fix)
	);
}

export function checkManifest(root: string): { results: CheckResult[]; manifest: Manifest | null } {
	const { manifest, errors } = readManifest(root);
	if (!manifest) {
		return {
			results: [
				result(
					'manifest',
					'.svelocity/manifest.json',
					'fail',
					errors.join('; '),
					'run create-svelocity to regenerate, or restore the file'
				)
			],
			manifest: null
		};
	}
	if (errors.length > 0) {
		return {
			results: [
				result(
					'manifest',
					'schema validation',
					'fail',
					errors.join('; '),
					'edit .svelocity/manifest.json to match .svelocity/manifest.schema.json'
				)
			],
			manifest
		};
	}
	return {
		results: [
			result('manifest', 'schema validation', 'pass', `stackVersion ${manifest.stackVersion}`)
		],
		manifest
	};
}

const ENV_FILES = ['apps/web/.env.local', 'apps/web/.env', '.env.local', '.env'];
const SETS_CONVEX_URL = /^\s*PUBLIC_CONVEX_URL\s*=\s*\S/m;

export function envSetsConvexUrl(root: string): boolean {
	return ENV_FILES.some((f) => {
		const path = join(root, f);
		if (!existsSync(path)) return false;
		try {
			return SETS_CONVEX_URL.test(readFileSync(path, 'utf8'));
		} catch {
			// unreadable file or a directory named like an env file — treat as not set
			return false;
		}
	});
}

export function checkConvex(root: string, opts: { envFileCopied?: boolean } = {}): CheckResult[] {
	const results: CheckResult[] = [];
	results.push(
		existsSync(join(root, 'packages/backend/convex'))
			? result('convex', 'convex directory', 'pass', 'packages/backend/convex')
			: result(
					'convex',
					'convex directory',
					'fail',
					'packages/backend/convex missing',
					'restore packages/backend from git history or re-run create-svelocity'
				)
	);
	const backendPkg = join(root, 'packages/backend/package.json');
	const hasConvexCli = pkgHasDep(backendPkg, 'convex');
	results.push(
		hasConvexCli
			? result('convex', 'convex cli dependency', 'pass', 'backend package includes convex')
			: result(
					'convex',
					'convex cli dependency',
					'warn',
					'backend package does not include convex dependency',
					'pnpm add convex --filter @svelocity/backend'
				)
	);
	const hasUrl = envSetsConvexUrl(root);
	if (opts.envFileCopied) {
		results.push(
			result(
				'convex',
				'PUBLIC_CONVEX_URL',
				'warn',
				'apps/web/.env.local created from .env.example — still set to the placeholder URL',
				'edit PUBLIC_CONVEX_URL in apps/web/.env.local'
			)
		);
	} else {
		results.push(
			hasUrl
				? result('convex', 'PUBLIC_CONVEX_URL', 'pass', 'set in env file')
				: result(
						'convex',
						'PUBLIC_CONVEX_URL',
						'warn',
						'no env file sets it',
						'cp apps/web/.env.example apps/web/.env.local and set PUBLIC_CONVEX_URL (or run doctor --fix)'
					)
		);
	}
	return results;
}

export function checkAuth(root: string): CheckResult[] {
	return [
		existsSync(join(root, 'packages/backend/convex/auth.ts')) &&
		existsSync(join(root, 'packages/backend/convex/auth.config.ts'))
			? result('auth', 'convex auth config', 'pass', 'auth.ts + auth.config.ts present')
			: result(
					'auth',
					'convex auth config',
					'warn',
					'auth.ts / auth.config.ts missing in packages/backend/convex',
					'restore them from git history (see the svelocity-auth skill)'
				)
	];
}

export function checkTargets(root: string, manifest: Manifest | null): CheckResult[] {
	const targets = manifest?.targets ?? ['web', 'desktop', 'mobile'];
	const results: CheckResult[] = [];
	if (targets.includes('web')) {
		results.push(
			existsSync(join(root, 'apps/web'))
				? result('targets', 'web app', 'pass', 'apps/web present')
				: result(
						'targets',
						'web app',
						'fail',
						'apps/web missing',
						'restore apps/web or remove "web" from manifest targets (svelocity-add-platform skill)'
					)
		);
	}
	if (targets.includes('desktop')) {
		const pkgPath = join(root, 'apps/desktop/package.json');
		const hasElectron = pkgHasDep(pkgPath, 'electron');
		results.push(
			hasElectron
				? result('targets', 'desktop app', 'pass', 'apps/desktop with electron dep')
				: result(
						'targets',
						'desktop app',
						'fail',
						'apps/desktop missing or electron dep absent',
						'run pnpm install; if apps/desktop is gone, restore it (svelocity-add-platform skill)'
					)
		);
	}
	if (targets.includes('mobile')) {
		results.push(
			existsSync(join(root, 'apps/mobile/capacitor.config.ts'))
				? result('targets', 'mobile app', 'pass', 'capacitor.config.ts present')
				: result(
						'targets',
						'mobile app',
						'fail',
						'apps/mobile/capacitor.config.ts missing',
						'restore apps/mobile or remove "mobile" from manifest targets (svelocity-add-platform skill)'
					)
		);
		const hasNative =
			existsSync(join(root, 'apps/mobile/ios')) && existsSync(join(root, 'apps/mobile/android'));
		results.push(
			hasNative
				? result('targets', 'mobile native projects', 'pass', 'ios/ + android/ present')
				: result(
						'targets',
						'mobile native projects',
						'warn',
						'native projects not generated yet',
						'pnpm --filter mobile exec cap add ios && pnpm --filter mobile exec cap add android'
					)
		);
	}
	return results;
}

export async function checkNativeTooling(): Promise<CheckResult[]> {
	const results: CheckResult[] = [];
	const androidHome = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT;
	results.push(
		androidHome && existsSync(androidHome)
			? result('native tooling', 'android sdk', 'pass', androidHome)
			: result(
					'native tooling',
					'android sdk',
					'warn',
					'ANDROID_HOME/ANDROID_SDK_ROOT not set',
					'install Android Studio (needed for Android builds only)'
				)
	);
	if (process.platform === 'darwin') {
		const xcode = await run('xcodebuild', ['-version']);
		const xcodeSummary = xcode.stdout.split('\n')[0] ?? 'xcodebuild';
		results.push(
			xcode.code === 0
				? result('native tooling', 'xcode', 'pass', xcodeSummary)
				: result(
						'native tooling',
						'xcode',
						'warn',
						'xcodebuild not found',
						'install Xcode (needed for iOS builds only)'
					)
		);
	}
	return results;
}
