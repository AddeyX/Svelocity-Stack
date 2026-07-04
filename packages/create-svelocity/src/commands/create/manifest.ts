import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateAgainstSchema, type Manifest } from '../../lib/manifest.js';

export function buildManifest(opts: {
	cliVersion: string;
	stackVersion: string;
	packageManager: string;
}): Manifest {
	return {
		stackVersion: opts.stackVersion,
		createdWith: `create-svelocity@${opts.cliVersion}`,
		targets: ['web', 'desktop', 'mobile'],
		ui: 'bits-ui',
		auth: 'convex-auth',
		backend: 'convex',
		packageManager: opts.packageManager,
		aiTargets: [],
		skills: []
	};
}

export function writeProjectManifest(projectRoot: string, manifest: Manifest): void {
	const schemaPath = join(projectRoot, '.svelocity/manifest.schema.json');
	if (existsSync(schemaPath)) {
		const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as unknown;
		const errors = validateAgainstSchema(manifest, schema);
		if (errors.length > 0) {
			throw new Error(`generated manifest is invalid:\n  ${errors.join('\n  ')}`);
		}
	}
	writeFileSync(
		join(projectRoot, '.svelocity/manifest.json'),
		JSON.stringify(manifest, null, '\t') + '\n'
	);
}
