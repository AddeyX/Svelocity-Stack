import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['src/create.ts'],
	format: 'esm',
	platform: 'node',
	noExternal: [/.*/],
	outExtensions: () => ({ js: '.js' }),
	dts: false,
	clean: true
});
