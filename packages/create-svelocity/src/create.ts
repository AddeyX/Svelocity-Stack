#!/usr/bin/env node
import {
	cancel,
	confirm,
	intro,
	isCancel,
	note,
	outro,
	select,
	spinner,
	text
} from '@clack/prompts';
import { defineCommand, runMain } from 'citty';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import validateNpmName from 'validate-npm-package-name';
import { buildManifest, writeProjectManifest } from './commands/create/manifest.js';
import { nextSteps } from './commands/create/next-steps.js';
import { scaffold } from './commands/create/scaffold.js';
import { targetDirProblem } from './commands/create/target-dir.js';
import { colors, glyph } from './lib/output.js';
import { cliVersion, pkgRoot } from './lib/pkg.js';
import { commandVersion, run } from './lib/proc.js';
import { isValidAppId, toAppId, toDisplayName, type TokenMap } from './lib/tokens.js';
import { MIN_NODE, MIN_PNPM, satisfiesMin } from './lib/versions.js';

const templateDir = join(pkgRoot, 'template');

function fail(message: string): never {
	console.error(`${glyph('fail')} ${message}`);
	process.exit(1);
}

function guard<T>(value: T | symbol): T {
	if (isCancel(value)) {
		cancel('Cancelled.');
		process.exit(1);
	}
	return value as T;
}

const main = defineCommand({
	meta: {
		name: 'create-svelocity',
		version: cliVersion,
		description: 'Scaffold a Svelocity Stack project'
	},
	args: {
		name: { type: 'string', description: 'Project name (also target directory)' },
		'app-id': { type: 'string', description: 'Reverse-DNS app id, e.g. com.acme.app' },
		yes: { type: 'boolean', description: 'Accept all defaults, no prompts' },
		git: { type: 'boolean', default: true, description: 'Initialize a git repository' },
		install: { type: 'boolean', default: true, description: 'Run pnpm install' }
	},
	async run({ args }) {
		intro(colors.bold('create-svelocity'));

		if (!satisfiesMin(process.version, MIN_NODE)) {
			fail(`Node ${MIN_NODE}+ required (you have ${process.version}). Install: https://nodejs.org`);
		}
		const pnpmVersion = await commandVersion('pnpm');
		if (!pnpmVersion)
			fail('pnpm not found. Install: npm install -g pnpm  (or corepack enable pnpm)');
		if (!satisfiesMin(pnpmVersion, MIN_PNPM)) {
			fail(`pnpm ${MIN_PNPM}+ required (you have ${pnpmVersion}). Upgrade: npm install -g pnpm`);
		}
		if (!existsSync(templateDir)) {
			fail(
				'template/ missing - run `pnpm --filter create-svelocity build:template` first (dev) or reinstall the package.'
			);
		}

		let name = args.name;
		if (!name && args.yes) fail('--yes requires --name');
		if (!name) {
			name = guard(
				await text({
					message: 'Project name',
					placeholder: 'my-app',
					validate(value) {
						const raw = value ?? '';
						const result = validateNpmName(raw);
						if (!result.validForNewPackages) {
							return (result.errors ?? result.warnings ?? ['invalid name']).join(', ');
						}
						return targetDirProblem(resolve(raw), raw);
					}
				})
			);
		}
		const nameCheck = validateNpmName(name);
		if (!nameCheck.validForNewPackages) {
			fail(
				`invalid project name ${JSON.stringify(name)}: ${(nameCheck.errors ?? nameCheck.warnings ?? []).join(', ')}`
			);
		}
		const targetDir = resolve(name);
		const dirProblem = targetDirProblem(targetDir, name);
		if (dirProblem) fail(dirProblem);

		let appId = args['app-id'] ?? (args.yes ? toAppId(name) : undefined);
		if (!appId) {
			appId = guard(
				await text({
					message: 'App id (reverse-DNS, used by desktop + mobile builds)',
					initialValue: toAppId(name),
					validate: (value) =>
						isValidAppId(value ?? '') ? undefined : 'must look like com.acme.app'
				})
			);
		}
		if (!isValidAppId(appId))
			fail(`invalid app id ${JSON.stringify(appId)} - must look like com.acme.app`);

		note(
			[
				'Bits UI (headless components)',
				'Convex backend + Convex Auth',
				'Targets: web, desktop (Electron), mobile (Capacitor)'
			].join('\n'),
			'Golden-path stack'
		);

		let convexNow = false;
		if (!args.yes) {
			convexNow =
				guard(
					await select({
						message: 'Convex backend setup',
						options: [
							{
								value: false,
								label: "I'll set up Convex later",
								hint: 'instructions printed at end'
							},
							{ value: true, label: 'Show me Convex walkthrough now' }
						]
					})
				) === true;
		}
		const doGit = args.yes
			? args.git
			: guard(await confirm({ message: 'Initialize git repository?', initialValue: args.git }));
		const doInstall = args.yes
			? args.install
			: guard(await confirm({ message: 'Install dependencies?', initialValue: args.install }));

		const tokens: TokenMap = {
			PROJECT_NAME: name,
			DISPLAY_NAME: toDisplayName(name),
			APP_ID: appId
		};
		const s = spinner();
		s.start('Copying template');
		scaffold(templateDir, targetDir, tokens);
		const rootPkg = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf8')) as {
			version?: string;
			packageManager?: string;
		};
		writeProjectManifest(
			targetDir,
			buildManifest({
				cliVersion,
				stackVersion: rootPkg.version ?? '0.1.0',
				packageManager: rootPkg.packageManager ?? 'pnpm@10.0.0'
			})
		);
		s.stop('Template copied');

		if (doGit) {
			const init = await run('git', ['init', '-b', 'main'], { cwd: targetDir });
			if (init.code === 0) {
				await run('git', ['add', '-A'], { cwd: targetDir });
				const commit = await run('git', ['commit', '-m', 'Initial commit from create-svelocity'], {
					cwd: targetDir
				});
				if (commit.code === 0) {
					console.log(`${glyph('pass')} git repository initialized`);
				} else {
					console.log(
						`${glyph('warn')} git init succeeded; initial commit failed - continuing`
					);
				}
			} else {
				console.log(`${glyph('warn')} git init failed - continuing without git`);
			}
		}

		if (doInstall) {
			console.log(colors.dim('Running pnpm install...'));
			const install = await run('pnpm', ['install'], { cwd: targetDir, inherit: true });
			if (install.code !== 0) {
				fail(
					'pnpm install failed - see output above. Fix and re-run `pnpm install` inside project.'
				);
			}
		}

		console.log(nextSteps({ projectName: name, convexNow }));
		outro(colors.green(`${name} is ready.`));
	}
});

runMain(main);
