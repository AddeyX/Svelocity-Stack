import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		// Workspace packages ship raw TS/Svelte source (ADR 0004) — bundle them
		// through Vite instead of leaving them external to Node.
		noExternal: [
			'@svelocity/app-core',
			'@svelocity/auth',
			'@svelocity/backend',
			'@svelocity/env',
			'@svelocity/theme',
			'@svelocity/ui'
		]
	},
	server: { port: 5173, strictPort: true }
});
