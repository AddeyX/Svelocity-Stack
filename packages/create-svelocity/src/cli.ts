#!/usr/bin/env node
import { defineCommand, runMain } from 'citty';
import { runDoctor } from './commands/doctor/run.js';
import { renderInfo } from './commands/info/info.js';
import { findProjectRoot, readManifest } from './lib/manifest.js';
import { colors, glyph } from './lib/output.js';
import { cliVersion } from './lib/pkg.js';

const doctor = defineCommand({
	meta: { name: 'doctor', description: 'Static health checks for a Svelocity project' },
	args: {
		json: {
			type: 'boolean',
			default: false,
			description: 'Machine-readable JSON output (root, results, summary)'
		},
		fix: {
			type: 'boolean',
			default: false,
			description: 'Apply safe auto-fixes (copy apps/web/.env.example to .env.local)'
		}
	},
	async run({ args }) {
		process.exit(await runDoctor(process.cwd(), { json: args.json, fix: args.fix }));
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
			console.error(
				`${glyph('fail')} could not read manifest: ${errors.join('; ')}\n  try ${colors.bold('svelocity doctor')}`
			);
			process.exit(1);
		}
		if (errors.length > 0) {
			console.error(
				`${glyph('warn')} manifest has schema issues - run ${colors.bold('svelocity doctor')}`
			);
		}
		console.log(renderInfo(manifest, root));
	}
});

runMain(
	defineCommand({
		meta: {
			name: 'svelocity',
			version: cliVersion,
			description: 'Svelocity Stack project tooling'
		},
		subCommands: { doctor, info }
	})
);
