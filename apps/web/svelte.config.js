import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'base-uri': ['none'],
				'object-src': ['none'],
				'frame-ancestors': ['none'],
				'img-src': ['self', 'data:'],
				'connect-src': [
					'self',
					'https:',
					'wss:',
					'http://127.0.0.1:*',
					'http://localhost:*',
					'ws://127.0.0.1:*',
					'ws://localhost:*'
				]
			}
		}
	}
};

export default config;
