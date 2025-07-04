// inject.ts
import { waitForElement } from "./waitForElement";
import { setupUIElements } from "./ui/setupUIElements"
import { handleGameView } from "./handleview";
import { exportCurrentProfile, loadProfileToLocalStorage, Profile } from "./profiles";

async function init() {    
    // remove ads, modify header, add command bar
	await setupUIElements();

    // load profile
    const preferences = await window.electronAPI.getAppPreferences()
    const profiles: Array<Profile> = preferences["profiles"]
    const currentProfileId = localStorage.getItem("current_profile") || "default"
    const currentProfile = profiles.find(p => p.id === currentProfileId) 
        || profiles.find(p => p.id === "default");

    // this obscenity avoids a reload loop
    if (!sessionStorage.getItem('profileInitialized')) {
        console.log('Setting profile for the first time...');
        sessionStorage.setItem('profileInitialized', 'true');
        console.log(currentProfile)
        if (currentProfile.autosave){
            // for a profile with autosave on,
            // if localstorage has this profile set
            // then on startup we make sure preferences.json
            // matches localstorage
            await exportCurrentProfile();
        } else {
            // for a profile with autosave off
            // we disregard changes in localstorage
            // and load it from preferences.json
            console.log("Loading", currentProfile)
            loadProfileToLocalStorage(currentProfile.id);
        }
        location.reload();
        return;
    }

    // finally show window to user
    window.electronAPI.notifyReadyToShow();

    try {
        const targetElement = await waitForElement("div[class$='view']");

        const viewObserver = new MutationObserver((mutations) => {
            const candidates = mutations
                .flatMap(mutation => Array.from(mutation.addedNodes) as any[])
                .filter((node) => (node as any).className);

            if (candidates.length === 1) {
                const viewName = candidates[0].className;
                handleGameView(viewName);
            }
        });

        viewObserver.observe(targetElement.parentElement!, {
            characterData: false,
            childList: true,
            attributes: false,
            subtree: true
        });
        console.log("View observer started!");
    } catch (error) {
        console.error("Failed to initialize observer:", error);
    }
}

init();