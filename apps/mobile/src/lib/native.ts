import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Minimal native wiring (Phase 5 §5.6): status bar style + Android back
 * button. Every call is guarded so the same bundle runs in a plain browser
 * during development.
 */
export async function initNative(onBack: () => boolean): Promise<void> {
	if (!Capacitor.isNativePlatform()) return;

	try {
		await StatusBar.setStyle({ style: Style.Light });
	} catch {
		// status bar plugin unavailable (e.g. web) — fine
	}

	void CapApp.addListener('backButton', ({ canGoBack }) => {
		const handled = onBack();
		if (!handled && !canGoBack) void CapApp.exitApp();
	});
}

export const isNative = () => Capacitor.isNativePlatform();
