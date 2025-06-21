import { fpsAlert } from "../alerts";
import { SubcommandMeta } from "../Command";

const fpsLock = (): void => {
	window.electronAPI.getAppPreferences()
        .then(() => {
            window.electronAPI.setAppPreference("fps_unlock", false)
			fpsAlert(false)
        })
        .catch(error => {
            console.error('Failed to load settings:', error);
        });
}

const fpsUnlock = (): void => {
	window.electronAPI.getAppPreferences()
        .then(() => {
            window.electronAPI.setAppPreference("fps_unlock", true)
            fpsAlert(true)
        })
        .catch(error => {
            console.error('Failed to load settings:', error);
        });
}

export class FpsCommand {
    static subcommands: { [subcommand: string]: SubcommandMeta } = {
        lock: {
            func: fpsLock,
            example: "",
            description: "Cap your FPS to your monitor's refresh rate (default)",
        },
        unlock: {
            func: fpsUnlock,
            example: "",
            description: "Uncap your FPS beyond your monitor's refresh rate",
        }
    };

    static execute(subcommand: string, rest: string): void {
        const meta = FpsCommand.subcommands[subcommand];
        console.log({ subcommand, rest })
        if (meta) {
            meta.func(rest);  // rest is the full string after subcommand
        } else {
            console.warn(`Unknown fps subcommand: ${subcommand}`);
        }
    }
}