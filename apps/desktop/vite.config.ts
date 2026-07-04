import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { DEV_PORTS, spaBaseConfig } from '@svelocity/config/vite';

// Renderer process (Svelte SPA).
export default defineConfig({
	plugins: [svelte()],
	// Electron loads the built renderer from the filesystem — relative asset paths.
	base: './',
	envPrefix: ['VITE_', 'PUBLIC_'],
	...spaBaseConfig({ port: DEV_PORTS.desktop }),
	build: {
		target: 'es2022',
		sourcemap: true,
		outDir: 'dist'
	}
});
