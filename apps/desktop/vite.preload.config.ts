import { defineConfig } from 'vite';

// Preload script — sandboxed preloads must be CommonJS, hence .cjs output.
export default defineConfig({
	build: {
		target: 'node22',
		outDir: 'dist-electron',
		emptyOutDir: false,
		sourcemap: true,
		lib: {
			entry: 'electron/preload.ts',
			formats: ['cjs'],
			fileName: () => 'preload.cjs'
		},
		rollupOptions: {
			external: ['electron']
		}
	}
});
