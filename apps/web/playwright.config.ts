import { defineConfig } from '@playwright/test';

/**
 * E2E against a real Convex backend. Requires:
 *   1. pnpm --filter @svelocity/backend dev   (local or cloud deployment)
 *   2. PUBLIC_CONVEX_URL set (apps/web/.env.local)
 * Specs self-skip when PUBLIC_CONVEX_URL is missing so CI stays green
 * without a live backend.
 */
// E2E_PORT dodges whatever else is squatting on 5173 locally.
const port = Number(process.env.E2E_PORT ?? 5173);

export default defineConfig({
	testDir: './e2e',
	timeout: 30_000,
	// json writes to PLAYWRIGHT_JSON_OUTPUT_FILE (set in CI); CLI flag forwarding
	// through pnpm is unreliable, so reporters/trace live here, not in run flags.
	reporter: process.env.CI ? [['list'], ['json']] : 'list',
	use: {
		baseURL: `http://localhost:${port}`,
		trace: 'retain-on-failure'
	},
	webServer: {
		command: `pnpm dev --port ${port}`,
		port,
		// never reuse in CI; locally a reused server must be THIS app on this port
		reuseExistingServer: !process.env.CI
	}
});
