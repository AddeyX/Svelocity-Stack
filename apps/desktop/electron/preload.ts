import { contextBridge, ipcRenderer } from 'electron';

/**
 * Minimal, explicit bridge (Phase 4 §4.3). Exposes exactly three things:
 * platform tag, app version, and validated external-link opening.
 * No filesystem, no shell, no raw ipcRenderer — add new capabilities as
 * individual audited methods, never by widening this object generically.
 */
const desktopApi = {
	platform: 'desktop' as const,
	getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
	openExternal: (url: string): Promise<void> => ipcRenderer.invoke('app:openExternal', url)
};

export type DesktopApi = typeof desktopApi;

contextBridge.exposeInMainWorld('svelocity', desktopApi);
