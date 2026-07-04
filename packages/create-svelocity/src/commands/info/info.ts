import type { Manifest } from '../../lib/manifest.js';
import { colors } from '../../lib/output.js';

export function renderInfo(manifest: Manifest): string {
	const list = (items: string[]) => (items.length > 0 ? items.join(', ') : '(none)');
	return [
		colors.bold('Svelocity project'),
		'',
		`  stack version    ${manifest.stackVersion}`,
		`  created with     ${manifest.createdWith}`,
		`  targets          ${list(manifest.targets)}`,
		`  ui               ${manifest.ui}`,
		`  auth             ${manifest.auth}`,
		`  backend          ${manifest.backend}`,
		`  package manager  ${manifest.packageManager}`,
		`  ai targets       ${list(manifest.aiTargets)}`,
		`  skills           ${list(manifest.skills)}`,
		'',
		'  version pins: pnpm-workspace.yaml (catalog) - rationale in docs/COMPATIBILITY.md'
	].join('\n');
}
