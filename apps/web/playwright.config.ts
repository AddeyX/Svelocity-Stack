import { defineConfig } from '@playwright/test';

/**
 * E2E against a real Convex backend. Requires:
 *   1. pnpm --filter @svelocity/backend dev   (local or cloud deployment)
 *   2. PUBLIC_CONVEX_URL set (apps/web/.env.local)
 * Specs self-skip when PUBLIC_CONVEX_URL is missing so CI stays green
 * without a live backend.
 */
export default defineConfig({
	testDir: './e2e',
	timeout: 30_000,
	use: {
		baseURL: 'http://localhost:5173'
	},
	webServer: {
		command: 'pnpm dev',
		port: 5173,
		reuseExistingServer: true
	}
});
