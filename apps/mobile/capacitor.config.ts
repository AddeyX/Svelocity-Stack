import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'dev.svelocity.tasks',
	appName: 'Shared Tasks',
	webDir: 'dist',
	// Live reload during native dev: uncomment and point at your machine's LAN IP.
	// server: { url: 'http://192.168.1.20:5175', cleartext: true },
	plugins: {
		SplashScreen: {
			launchShowDuration: 800,
			launchAutoHide: true,
			backgroundColor: '#fafaf9'
		}
	}
};

export default config;
