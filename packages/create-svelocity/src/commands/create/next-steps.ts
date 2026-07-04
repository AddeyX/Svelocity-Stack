import { colors } from '../../lib/output.js';

export function nextSteps(opts: { projectName: string; convexNow: boolean }): string {
	const convexBlock = opts.convexNow
		? [
				'# Set up Convex (creates a deployment and fills backend env):',
				'pnpm --filter @svelocity/backend dev',
				'# When it prints your deployment URL, point the web app at it:',
				'cp apps/web/.env.example apps/web/.env.local',
				'#   then set PUBLIC_CONVEX_URL in apps/web/.env.local',
				''
			]
		: [
				'# When ready, set up Convex:',
				'pnpm --filter @svelocity/backend dev',
				'cp apps/web/.env.example apps/web/.env.local   # set PUBLIC_CONVEX_URL',
				''
			];

	return [
		'',
		colors.bold('Next steps:'),
		'',
		`cd ${opts.projectName}`,
		'',
		...convexBlock,
		'# Run the apps:',
		'pnpm dev            # web',
		'pnpm dev:desktop    # desktop (Electron)',
		'pnpm dev:mobile     # mobile web shell',
		'',
		'# Generate native mobile projects (one-time):',
		'pnpm --filter mobile exec cap add ios',
		'pnpm --filter mobile exec cap add android',
		'',
		'# Health check any time:',
		'pnpm exec svelocity doctor',
		''
	].join('\n');
}
