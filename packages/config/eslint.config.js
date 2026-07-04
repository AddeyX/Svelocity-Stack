import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Shared ESLint flat config for every Svelocity workspace.
 *
 * Consume from a package's eslint.config.js:
 *
 *   export { default } from '@svelocity/config/eslint';
 *
 * or spread it and append package-specific overrides.
 */
export default tseslint.config(
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/build/**',
			'**/.svelte-kit/**',
			'**/_generated/**',
			'**/android/**',
			'**/ios/**',
			'**/release/**',
			'**/coverage/**'
		]
	},
	...tseslint.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// Underscore-prefixed args are intentionally unused (Convex handlers, callbacks).
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: { parser: tseslint.parser }
		}
	}
);
