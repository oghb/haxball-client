import { customAlert } from "../alerts"
import { SubcommandMeta } from "../Command"

const shortcutAdd = (input: string): void => {
    const commandInput = document.getElementById("commandline") as HTMLInputElement;
    window.electronAPI.getAppPreferences()
        .then(prefs => {
            const shortcuts = prefs["shortcuts"]
            const newShortcut = input.split(",");
        
            if (newShortcut.length !== 2) {
                commandInput.value = "";
                commandInput.placeholder = "Wrong syntax! Example: shortcut add !c,!claim";
                setTimeout(() => {
                    commandInput.placeholder = "Enter a command";
                }, 5000);
                return;
            }
        
            if (shortcuts.some((s: [string, string]) => s[0] === newShortcut[0])) {
                commandInput.placeholder = `Shortcut already exists!`;
                setTimeout(() => {
                    commandInput.placeholder = "Enter a command";
                }, 4000);
                return;
            }
        
            shortcuts.push(newShortcut);
            window.electronAPI.setAppPreference("shortcuts", shortcuts)
        
            commandInput.value = "";
            commandInput.placeholder = `New shortcut added: '${newShortcut[0]}' → '${newShortcut[1]}'`;
            setTimeout(() => {
                commandInput.placeholder = "Enter a command";
            }, 3000);
        })
        .catch(error => {
            console.error('Failed to load settings:', error);
        });
}

const shortcutRemove = (inputShortcut: string): void => {
    const commandInput = document.getElementById("commandline") as HTMLInputElement;
    window.electronAPI.getAppPreferences()
        .then(prefs => {
            const shortcuts = prefs["shortcuts"]
            commandInput.value = "";

            let updatedShortcuts = [];

            for (let i = 0; i < shortcuts.length; i++) {
                if (shortcuts[i][0] != inputShortcut)
                    updatedShortcuts.push(shortcuts[i]);
            }

            if (shortcuts.length == updatedShortcuts.length) {
                commandInput.placeholder = `Not found! Type 'shortcut list' to check the shortcuts you added`;
                setTimeout(function () {
                    commandInput.placeholder = "Enter a command";
                }, 4000);
            } else {
                window.electronAPI.setAppPreference("shortcuts", updatedShortcuts)
                commandInput.placeholder = `Shortcut removed`;
                setTimeout(function () {
                    commandInput.placeholder = "Enter a command";
                }, 3000);
            }
        })
        .catch(error => {
            console.error('Failed to load settings:', error);
        });
}

// input argument just so it doens't mess up Command
const shortcutList = (input: string = ""): void => {
	const commandInput = document.getElementById("commandline") as HTMLInputElement;
    window.electronAPI.getAppPreferences()
        .then(prefs => {
            const shortcuts = prefs["shortcuts"]

            commandInput.value = "";

            if (shortcuts.length == 0) {
                commandInput.placeholder = `You haven't set any shortcuts`;
                setTimeout(function () {
                    commandInput.placeholder = "Enter a command";
                }, 3000);
                return;
            }
            let shortcutsString = "";
            for (let i = 0; i < shortcuts.length; i++)
                shortcutsString += `'${shortcuts[i][0]}' → '${shortcuts[i][1]}'\n`;
            customAlert("Shortcuts list", shortcutsString)
            
            commandInput.placeholder = "Enter a command";
        })
        .catch(error => {
            console.error('Failed to load settings:', error);
        });
}

export class ShortcutCommand {
    static subcommands: { [subcommand: string]: SubcommandMeta } = {
        add: {
            func: shortcutAdd,
            example: "/e,/extrapolation",
            description: "Add a new shortcut",
        },
        remove: {
            func: shortcutRemove,
            example: "/e",
            description: "Remove an existing shortcut",
        },
        list: {
            func: shortcutList,
            example: "",
            description: "List all existing shortcuts",
        },
    };

    static execute(subcommand: string, rest: string): void {
        const meta = ShortcutCommand.subcommands[subcommand];
        console.log({ subcommand, rest })
        if (meta) {
            meta.func(rest);  // rest is the full string after subcommand
        } else {
            console.warn(`Unknown shortcut subcommand: ${subcommand}`);
        }
    }
}