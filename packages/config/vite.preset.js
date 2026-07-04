/**
 * Shared Vite constants + tiny helpers for the SPA app shells (desktop, mobile).
 * Apps own their vite.config.ts; this keeps ports and shared options in one place.
 */

export const DEV_PORTS = {
	web: 5173,
	desktop: 5174,
	mobile: 5175
};

/**
 * Base config shared by the plain-Vite SPA shells.
 * @param {{ port: number }} opts
 */
export function spaBaseConfig({ port }) {
	return {
		server: { port, strictPort: true },
		build: { target: 'es2022', sourcemap: true }
	};
}
