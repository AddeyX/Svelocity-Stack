import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { DEV_PORTS, spaBaseConfig } from '@svelocity/config/vite';

// Mobile WebView SPA (Capacitor).
export default defineConfig({
	plugins: [svelte()],
	base: './',
	envPrefix: ['VITE_', 'PUBLIC_'],
	...spaBaseConfig({ port: DEV_PORTS.mobile }),
	build: {
		target: 'es2022',
		sourcemap: true,
		outDir: 'dist'
	}
});
