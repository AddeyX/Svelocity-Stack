import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { envSetsConvexUrl } from './checks.js';

export interface AppliedFix {
	name: string;
	detail: string;
}

/**
 * Minimal auto-fixes for `doctor --fix`. Only one is supported: when no env
 * file sets PUBLIC_CONVEX_URL and apps/web/.env.example exists but
 * apps/web/.env.local does not, copy the example into place. The user still
 * edits the URL afterwards.
 */
export function applyFixes(root: string): AppliedFix[] {
	const fixes: AppliedFix[] = [];
	const example = join(root, 'apps/web/.env.example');
	const local = join(root, 'apps/web/.env.local');
	if (!envSetsConvexUrl(root) && existsSync(example) && !existsSync(local)) {
		copyFileSync(example, local);
		fixes.push({
			name: 'PUBLIC_CONVEX_URL',
			detail: 'copied apps/web/.env.example to apps/web/.env.local — edit PUBLIC_CONVEX_URL'
		});
	}
	return fixes;
}
