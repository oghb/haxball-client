import { autoUpdater } from "./autoUpdater"
import { injectFavoriteRoomsButtons } from "./favrooms";
import { addTranspUIButton, setGameView, toggleTransparentUI } from "./gameview";

export const handleGameView = (viewName: string): void => {
	switch(true) {
		// when the room list appears
		case viewName === "dropdown":
			autoUpdater();
			break;
		// when a room is entered
		case [
			"game-view", 
			"game-view showing-room-view chat-bg-full", 
			"game-view showing-room-view"
		].includes(viewName):
			setTimeout(setGameView, 200); // improve, don't use timeout
			break;
		case viewName === "room-view":
			addTranspUIButton();
			toggleTransparentUI();
			break;
		case viewName === "roomlist-view":
			injectFavoriteRoomsButtons();
			break;
	}
}