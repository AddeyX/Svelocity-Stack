import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { componentTest } from '@svelocity/config/vitest';

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		// Force browser condition so Svelte 5 resolves client (not SSR) runtime in jsdom.
		conditions: ['browser']
	},
	test: componentTest
});
