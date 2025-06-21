import { waitForElement } from "../waitForElement";

export const removeAds = async (): Promise<void> => {
	// removes ads
    const targetElement = await waitForElement("body > div > div.rightbar", false)
	document.getElementsByClassName("rightbar")[0].innerHTML = "";
}