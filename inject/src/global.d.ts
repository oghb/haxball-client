export {};

declare global {
	interface Window {
		electronAPI: {
			setAppPreference: (key: string, value: any) => Promise<any>;
			getAppPreferences: () => Promise<any>;
			restartApp: () => void;
			notifyReadyToShow: () => void;
			exportPreferencesFile: () => Promise<any>;
			importPreferencesFile: () => Promise<any>;
			deletePreferencesFile: () => Promise<any>;
			getAppVersion: () => Promise<string>;
			generatePlayerAuthKey: () => Promise<string>;
			updateDiscordRPC: (details: string) => void;
		};
	}
};