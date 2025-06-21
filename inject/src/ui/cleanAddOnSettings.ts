export const cleanAddOnSettings = (): void => {
	const gameframe = document.getElementsByClassName("gameframe")[0].contentDocument as HTMLIFrameElement;
	const settings = gameframe.querySelector("div.section.selected")

	// remove toggle
	settings.querySelector("div#haxShortcutConfig").remove()

	// remove "Configure shortcuts" div
	settings.childNodes[settings.childNodes.length - 2].remove()
}