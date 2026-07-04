import { app, ipcMain, shell } from 'electron';
import { isSafeExternalUrl } from './url-safety.js';

/**
 * The entire IPC surface (v1). Every channel validates its input in the main
 * process — the renderer is untrusted. Channels mirror electron/preload.ts.
 */
export function registerIpcHandlers() {
	ipcMain.handle('app:getVersion', () => app.getVersion());

	ipcMain.handle('app:openExternal', (_event, url: unknown) => {
		if (typeof url !== 'string' || !isSafeExternalUrl(url)) {
			throw new Error('Blocked openExternal: only http(s) URLs are allowed');
		}
		return shell.openExternal(url);
	});
}
