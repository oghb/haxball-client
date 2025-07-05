import { removeAds } from "./removeAds";
import { addAddressBarToHeader, setupCustomHeader } from "./setupCustomHeader";

export const setupUIElements = async (): Promise<void> => {
	await removeAds();
	await setupCustomHeader();
	addAddressBarToHeader();
}