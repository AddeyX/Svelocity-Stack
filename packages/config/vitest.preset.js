/**
 * Vitest presets. Spread into a package's vitest.config.ts `test` field:
 *
 *   import { defineConfig } from 'vitest/config';
 *   import { nodeTest } from '@svelocity/config/vitest';
 *   export default defineConfig({ test: nodeTest });
 */

/** Pure TS packages (app-core, env, auth helpers). */
export const nodeTest = {
	environment: 'node',
	include: ['src/**/*.spec.ts', 'test/**/*.spec.ts']
};

/** Svelte component packages/apps — requires jsdom + @testing-library/svelte. */
export const componentTest = {
	environment: 'jsdom',
	include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
	setupFiles: []
};
