/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly PUBLIC_CONVEX_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

/** Bridge exposed by electron/preload.ts. */
interface Window {
	svelocity?: {
		platform: 'desktop';
		getVersion(): Promise<string>;
		openExternal(url: string): Promise<void>;
	};
}
