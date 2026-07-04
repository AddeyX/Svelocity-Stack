import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readManifest, type Manifest } from '../../lib/manifest.js';
import type { CheckStatus } from '../../lib/output.js';
import { commandVersion, run } from '../../lib/proc.js';
import { MIN_NODE, MIN_PNPM, satisfiesMin } from '../../lib/versions.js';

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

export async function checkEnvironment(): Promise<CheckResult[]> {
	const results: CheckResult[] = [];
	results.push(
		satisfiesMin(process.version, MIN_NODE)
			? result('environment', 'node', 'pass', process.version)
			: result(
					'environment',
					'node',
					'fail',
					`${process.version} < required ${MIN_NODE}`,
					`install Node ${MIN_NODE}+`
				)
	);
	const pnpm = await commandVersion('pnpm');
	if (!pnpm) {
		results.push(result('environment', 'pnpm', 'fail', 'not found', 'npm install -g pnpm'));
	} else {
		results.push(
			satisfiesMin(pnpm, MIN_PNPM)
				? result('environment', 'pnpm', 'pass', pnpm)
				: result(
						'environment',
						'pnpm',
						'fail',
						`${pnpm} < required ${MIN_PNPM}`,
						'npm install -g pnpm'
					)
		);
	}
	return results;
}

export function checkWorkspace(root: string): CheckResult[] {
	const entries: Array<[string, string]> = [
		['pnpm-workspace.yaml', 'pnpm-workspace.yaml'],
		['apps directory', 'apps'],
		['packages directory', 'packages']
	];
	return entries.map(([name, rel]) =>
		existsSync(join(root, rel))
			? result('workspace', name, 'pass', 'present')
			: result('workspace', name, 'fail', `${rel} missing`)
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
			results: [result('manifest', 'schema validation', 'fail', errors.join('; '))],
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

export function checkConvex(root: string): CheckResult[] {
	const results: CheckResult[] = [];
	results.push(
		existsSync(join(root, 'packages/backend/convex'))
			? result('convex', 'convex directory', 'pass', 'packages/backend/convex')
			: result('convex', 'convex directory', 'fail', 'packages/backend/convex missing')
	);
	const backendPkg = join(root, 'packages/backend/package.json');
	const hasConvexCli =
		existsSync(backendPkg) && readFileSync(backendPkg, 'utf8').includes('"convex"');
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
	const envFiles = ['apps/web/.env.local', 'apps/web/.env', '.env.local', '.env'];
	const hasUrl = envFiles.some(
		(f) =>
			existsSync(join(root, f)) && readFileSync(join(root, f), 'utf8').includes('PUBLIC_CONVEX_URL')
	);
	results.push(
		hasUrl
			? result('convex', 'PUBLIC_CONVEX_URL', 'pass', 'set in env file')
			: result(
					'convex',
					'PUBLIC_CONVEX_URL',
					'warn',
					'no env file sets it',
					'cp apps/web/.env.example apps/web/.env.local and set PUBLIC_CONVEX_URL'
				)
	);
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
					'auth.ts / auth.config.ts missing in packages/backend/convex'
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
				: result('targets', 'web app', 'fail', 'apps/web missing')
		);
	}
	if (targets.includes('desktop')) {
		const pkgPath = join(root, 'apps/desktop/package.json');
		const hasElectron = existsSync(pkgPath) && readFileSync(pkgPath, 'utf8').includes('"electron"');
		results.push(
			hasElectron
				? result('targets', 'desktop app', 'pass', 'apps/desktop with electron dep')
				: result('targets', 'desktop app', 'fail', 'apps/desktop missing or electron dep absent')
		);
	}
	if (targets.includes('mobile')) {
		results.push(
			existsSync(join(root, 'apps/mobile/capacitor.config.ts'))
				? result('targets', 'mobile app', 'pass', 'capacitor.config.ts present')
				: result('targets', 'mobile app', 'fail', 'apps/mobile/capacitor.config.ts missing')
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
