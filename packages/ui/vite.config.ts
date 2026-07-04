import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Dev sandbox for component preview: pnpm --filter @svelocity/ui dev
export default defineConfig({
	root: 'preview',
	plugins: [svelte()],
	server: { port: 5199, strictPort: true }
});
