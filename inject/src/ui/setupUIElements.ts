import { removeAds } from "./removeAds";
import { setupCommandBar } from "./setupCommandBar";
import { addAddressBarToHeader, setupCustomHeader } from "./setupCustomHeader";

export const setupUIElements = async (): Promise<void> => {
	await removeAds();
	await setupCustomHeader();
	addAddressBarToHeader();
	await setupCommandBar();
}