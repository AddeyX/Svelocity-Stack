import { defineConfig } from 'vite';

// Electron main process build.
export default defineConfig({
	build: {
		target: 'node22',
		outDir: 'dist-electron',
		emptyOutDir: false,
		sourcemap: true,
		lib: {
			entry: 'electron/main.ts',
			formats: ['es'],
			fileName: () => 'main.js'
		},
		rollupOptions: {
			external: ['electron', /^node:/]
		}
	}
});
