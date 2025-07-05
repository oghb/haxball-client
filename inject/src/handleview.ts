import { autoUpdater } from "./autoUpdater"
import { injectFavoriteRoomsButtons } from "./favrooms";
import { addTranspUIButton, setGameView, toggleTransparentUI } from "./gameview";
import { toggleHeaderVisibility } from "./ui/setupCustomHeader";

export const handleGameView = (viewName: string): void => {
	switch(true) {
		case viewName === "dropdown":
			if (localStorage.getItem("header_visible") === "false"){
				toggleHeaderVisibility();
			}
			window.electronAPI.updateDiscordRPC("Waiting in the Room List")
			autoUpdater();
			break;
		// when a room is entered
		case [
			"game-view", 
			"game-view showing-room-view chat-bg-full", 
			"game-view showing-room-view"
		].includes(viewName):
			if (localStorage.getItem("header_visible") === "true"){
				toggleHeaderVisibility();
			}
			window.electronAPI.updateDiscordRPC("Playing in a Room")
			setTimeout(setGameView, 200); // improve, don't use timeout
			break;
		case viewName === "room-view":
			if (localStorage.getItem("header_visible") === "true"){
				toggleHeaderVisibility();
			}
			addTranspUIButton();
			toggleTransparentUI();
			break;
		case viewName === "roomlist-view":
			injectFavoriteRoomsButtons();
			break;
	}
}