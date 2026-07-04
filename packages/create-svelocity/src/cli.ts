#!/usr/bin/env node
import { defineCommand, runMain } from 'citty';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runDoctor } from './commands/doctor/run.js';
import { renderInfo } from './commands/info/info.js';
import { findProjectRoot, readManifest } from './lib/manifest.js';
import { colors, glyph } from './lib/output.js';

const pkgRoot = resolve(fileURLToPath(import.meta.url), '../..');
const cliPkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')) as { version: string };

const doctor = defineCommand({
	meta: { name: 'doctor', description: 'Static health checks for a Svelocity project' },
	async run() {
		process.exit(await runDoctor(process.cwd()));
	}
});

const info = defineCommand({
	meta: { name: 'info', description: 'Show what the CLI generated (manifest + stack)' },
	run() {
		const root = findProjectRoot(process.cwd());
		if (!root) {
			console.error(
				`${glyph('fail')} not inside a Svelocity project - no .svelocity/manifest.json found. Run ${colors.bold('svelocity doctor')} for details or create-svelocity for a new project.`
			);
			process.exit(1);
		}
		const { manifest, errors } = readManifest(root);
		if (!manifest) {
			console.error(`${glyph('fail')} could not read manifest: ${errors.join('; ')}\n  try ${colors.bold('svelocity doctor')}`);
			process.exit(1);
		}
		if (errors.length > 0) {
			console.error(`${glyph('warn')} manifest has schema issues - run ${colors.bold('svelocity doctor')}`);
		}
		console.log(renderInfo(manifest));
	}
});

runMain(
	defineCommand({
		meta: { name: 'svelocity', version: cliPkg.version, description: 'Svelocity Stack project tooling' },
		subCommands: { doctor, info }
	})
);
