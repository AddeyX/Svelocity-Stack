import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { nodeTest } from '@svelocity/config/vitest';

export default defineConfig({
	plugins: [svelte()],
	test: nodeTest
});
