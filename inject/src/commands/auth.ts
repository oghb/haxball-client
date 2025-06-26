import { authShowAlert } from "../alerts";
import { SubcommandMeta } from "../Command";
import { COMMAND_BAR_PLACEHOLDER } from "../constants";

const authShow = (): void => {
	const commandInput = document.getElementById("commandline") as HTMLInputElement;
	commandInput.value = "";
	const player_auth_key = localStorage.getItem("player_auth_key");
	const publicAuth = player_auth_key.split(".")[1]
	const privateKey = player_auth_key

    authShowAlert(publicAuth, privateKey)
}

const authSet = (input: string): void => {
    const commandInput = document.getElementById("commandline") as HTMLInputElement;
	commandInput.value = "";

    if (!input.match(/^idkey\..{43}\..{87}/)){
        commandInput.placeholder = `Invalid private key, try copying and pasting again`;
        setTimeout(function () {
            commandInput.placeholder = COMMAND_BAR_PLACEHOLDER;
        }, 3000);
        return;
    }

    localStorage.setItem("player_auth_key", input);
    commandInput.placeholder ="New player auth set! Reloading HaxBall...";
    setTimeout(function() {window.location.reload()}, 2000);
}

const authNew = (): void => {
    const commandInput = document.getElementById("commandline") as HTMLInputElement;
	commandInput.value = "";

    localStorage.removeItem("player_auth_key");
    commandInput.placeholder ="New player auth set! Reloading HaxBall...";
    setTimeout(function() {window.location.reload()}, 2000)
}

export class AuthCommand {
    static subcommands: { [subcommand: string]: SubcommandMeta } = {
        show: {
            func: authShow,
            example: "",
            description: "Check your public auth and private key",
        },
        new: {
            func: authNew,
            example: "",
            description: "Change to a brand new auth"
        },
        set: {
            func: authSet,
            example: "idkey.x",
            description: "Set a different public auth using its private key",
        }
    };

    static execute(subcommand: string, rest: string): void {
        const meta = AuthCommand.subcommands[subcommand];
        console.log({ subcommand, rest })
        if (meta) {
            meta.func(rest);  // rest is the full string after subcommand
        } else {
            console.warn(`Unknown auth subcommand: ${subcommand}`);
        }
    }
}