import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['src/create.ts', 'src/cli.ts'],
	format: 'esm',
	platform: 'node',
	noExternal: [/.*/],
	outExtensions: () => ({ js: '.js' }),
	dts: false,
	clean: true
});
