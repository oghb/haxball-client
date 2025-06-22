import { waitForElement } from "./waitForElement";

const addShortcutListener = (gameframe: HTMLIFrameElement): void => {
	const chatInput = gameframe.contentDocument.querySelector('[data-hook="input"]') as HTMLInputElement;
	
	chatInput.addEventListener("keyup", function () {
        window.electronAPI.getAppPreferences()
            .then(prefs => {          
                const shortcuts = prefs["shortcuts"];
                for (let i = 0; i < shortcuts.length; i++) {
                    if (chatInput.value === shortcuts[i][0]) {
                        chatInput.value = shortcuts[i][1];
                        return;
                    }
                }
            })
            .catch(error => {
                console.error('Failed to load settings:', error);
            });
	});
}

export const toggleTransparentUI = async (): Promise<void> => {
    const gameframe = document.getElementsByClassName("gameframe")[0] as HTMLIFrameElement;
	if (!gameframe?.contentDocument) {
		new Error("Gameframe or contentDocument not found");
		return;
	}

    const prefs = await window.electronAPI.getAppPreferences();
    const enable = prefs["transp_ui"];

    if (enable) {
        // gameframe.contentDocument.getElementsByClassName("game-view chat-bg-full")[0].style.cssText = "--chat-opacity: 0.063;"
        gameframe.contentDocument.getElementsByClassName("game-view")[0].style.cssText = "--chat-opacity: 0.063;"
        gameframe.contentDocument.querySelector(".chatbox-view-contents>.input input[type=text]").style.backgroundColor = "rgba(26, 33, 37, 0.063)"
        gameframe.contentDocument.querySelector(".chatbox-view-contents>.input>button").style.background = "rgba(26, 33, 37, 0.063)"
        gameframe.contentDocument.getElementsByClassName("bar")[0].style.background = "rgba(26, 33, 37, 0.063)"
        gameframe.contentDocument.querySelectorAll(".game-view > .buttons")[0].style.background = "rgba(26, 33, 37, 0.063)"
        gameframe.contentDocument.querySelectorAll(".game-view > .buttons")[0].childNodes.forEach(
            (button) => button.style.background = "rgba(26, 33, 37, 0.063)"
        )
        gameframe.contentDocument.getElementsByClassName("sound-button-container")[0].childNodes.forEach(
            (child) => child.style.background = "rgba(26, 33, 37, 0.063)"
        )
        gameframe.contentDocument.getElementsByClassName("container")[0].style.background = "rgba(26, 33, 37, 0.063)"
        gameframe.contentDocument.getElementsByClassName("container")[0].style.backdropFilter = "blur(5px)"
        gameframe.contentDocument.querySelectorAll(".dialog button, .room-view>.container button").forEach((button) => button.style.background = "rgba(26, 33, 37, 0.063)")
        gameframe.contentDocument.querySelectorAll(".top-section  > .room-view > .container > .teams > .player-list-view").forEach(
            (list) => list.childNodes[1].style.background = "rgba(26, 33, 37, 0.063)"
        )
        gameframe.contentDocument.querySelectorAll(".dialog select, .room-view>.container select").forEach((select) => {
            select.style.background = "rgba(26, 33, 37, 0.063)"
            select.style.border = "0px"
        })

        // add shadow to chat messages
        // gameframe.contentDocument.querySelectorAll('.chatbox-view-contents > .log .log-contents p').forEach(p => { p.style.textShadow = "1px 1px 1px #000, 0px 1px 1px #000;"})
    } else {
        const normalChatOpacity = parseFloat(localStorage.getItem("chat_opacity") || "0.8")
        gameframe.contentDocument.getElementsByClassName("game-view")[0].style.cssText = `--chat-opacity: ${normalChatOpacity}`
        gameframe.contentDocument.querySelector(".chatbox-view-contents>.input input[type=text]").style.backgroundColor = "#111619"
        gameframe.contentDocument.getElementsByClassName("bar")[0].style.background = ""
        gameframe.contentDocument.querySelectorAll(".game-view > .buttons")[0].style.background = ""
        gameframe.contentDocument.querySelectorAll(".game-view > .buttons")[0].childNodes.forEach(
            (button) => button.style.background = ""
        )
        gameframe.contentDocument.getElementsByClassName("sound-button-container")[0].childNodes.forEach(
            (child) => child.style.background = ""
        )
        gameframe.contentDocument.getElementsByClassName("container")[0].style.background = ""
        gameframe.contentDocument.getElementsByClassName("container")[0].style.backdropFilter = "blur(5px)"
        gameframe.contentDocument.querySelectorAll(".dialog button, .room-view>.container button").forEach((button) => button.style.background = "")
        gameframe.contentDocument.querySelectorAll(".top-section  > .room-view > .container > .teams > .player-list-view").forEach(
            (list) => list.childNodes[1].style.background = ""
        )
        gameframe.contentDocument.querySelectorAll(".dialog select, .room-view>.container select").forEach((select) => {
            select.style.background = ""
            select.style.border = "1px solid #111619"
        })

        // gameframe.contentDocument.querySelectorAll('.chatbox-view-contents > .log .log-contents p').forEach(p => { p.style.textShadow = ""})
    }
}

const removeUnwantedElements = (gameframe: HTMLIFrameElement): void => {
	gameframe.contentDocument.getElementById("translateDisclaimer").remove();

	// remove button below esc to hide chat placeholder
	(gameframe.contentDocument.querySelector(".chatbox-view-contents>.input input[type=text]") as HTMLInputElement).placeholder = "";

	// remove show navbar button
	gameframe.contentDocument.querySelector("body > div:nth-child(1) > div > div.buttons > button:nth-child(5)").remove();

	// remove togglechat
	gameframe.contentDocument.getElementById("toggleChat").childNodes[0].remove();
}

export const addTranspUIButton = async (): Promise<void> => {
    const gameframe = document.getElementsByClassName("gameframe")[0] as HTMLIFrameElement;
	if (!gameframe?.contentDocument) {
		new Error("Gameframe or contentDocument not found");
		return;
	}

    // wait for the buttons to show up
    const targetElement = await waitForElement(".header-btns");

	const headerButtons = gameframe.contentDocument.getElementsByClassName("header-btns")[0];

    if (gameframe.contentDocument.getElementById("invisui-btn") !== null){
        return;
    }
    
    const prefs = await window.electronAPI.getAppPreferences();
    const enabled = prefs["transp_ui"];
    let transpButton = document.createElement("button") as HTMLButtonElement;
    transpButton.id = "invisui-btn";
    transpButton.innerHTML = enabled ? "Normal UI" : "Clear UI";
    transpButton.style.background = enabled
        ? "rgba(26, 33, 37, 0.063)"
        : ""

    transpButton.addEventListener(
        "click",
        async () => {
            const prefs = await window.electronAPI.getAppPreferences();
            const newState = !prefs["transp_ui"]
            transpButton.innerHTML = newState ? "Normal UI" : "Clear UI";

            await window.electronAPI.setAppPreference("transp_ui", newState);

            toggleTransparentUI();
        },
        false
    );
    const firstHeaderButton = headerButtons.querySelector("button")
    headerButtons.insertBefore(transpButton, firstHeaderButton)
}

export const setGameView = async (): Promise<void> => {
	const gameframe = document.getElementsByClassName("gameframe")[0] as HTMLIFrameElement;
	if (!gameframe?.contentDocument) {
		new Error("Gameframe or contentDocument not found");
		return;
	}
	addShortcutListener(gameframe);
	removeUnwantedElements(gameframe);
    await addTranspUIButton();
    await toggleTransparentUI();
}