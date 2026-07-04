import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerIpcHandlers } from './ipc.js';
import { isSafeExternalUrl } from './url-safety.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEV_SERVER_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5174' : null;

function createWindow() {
	const win = new BrowserWindow({
		width: 480,
		height: 720,
		minWidth: 360,
		minHeight: 500,
		title: 'Shared Tasks',
		backgroundColor: '#fafaf9',
		webPreferences: {
			// Security baseline (Phase 4 §4.11): isolated, sandboxed renderer
			// with a minimal preload API. Never widen these.
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			preload: path.join(__dirname, 'preload.cjs')
		}
	});

	// New-window requests (target=_blank, window.open) leave the app via the
	// OS browser — nothing external renders inside the shell.
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (isSafeExternalUrl(url)) void shell.openExternal(url);
		return { action: 'deny' };
	});

	// Block in-app navigation away from our own renderer.
	win.webContents.on('will-navigate', (event, url) => {
		const allowed = DEV_SERVER_URL ? url.startsWith(DEV_SERVER_URL) : url.startsWith('file:');
		if (!allowed) {
			event.preventDefault();
			if (isSafeExternalUrl(url)) void shell.openExternal(url);
		}
	});

	if (DEV_SERVER_URL) {
		void win.loadURL(DEV_SERVER_URL);
	} else {
		void win.loadFile(path.join(__dirname, '../dist/index.html'));
	}
}

app.whenReady().then(() => {
	registerIpcHandlers();
	createWindow();

	app.on('activate', () => {
		// macOS: re-create the window when the dock icon is clicked.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	// Windows/Linux quit with the last window; macOS stays in the dock.
	if (process.platform !== 'darwin') app.quit();
});
