import { customAlert } from "./alerts";

interface GeoOverride {
    lat: number;
    lon: number;
    code: string;
}

export interface Profile {
    id: string;
    name: string;
    autosave: boolean;
    avatar: string | null;
    extrapolation: string | null;
    fav_rooms: string[];
    geo_override: GeoOverride | null;
    player_auth_key: string | null;
    player_name: string | null;
}

export const loadProfileToLocalStorage = (profileId: string): void => {
    window.electronAPI.getAppPreferences()
        .then((prefs) => {
            const profiles: Array<Profile> = prefs["profiles"];
            const profile = profiles.find(p => p.id === profileId) || profiles[0];
			localStorage.setItem("current_profile", profile.id)

            // keys of profile that have a corresponding entry in localstorage
            Object.keys(profile)
            .filter(
                attr_name => !["id", "name", "autosave"].includes(attr_name)
            )
            .forEach(attr_name => {
                let attr_val = profile[attr_name]
                if (attr_val === null){
                    localStorage.removeItem(attr_name)
                } else {
                    if (attr_name === "geo_override"){
                        attr_val = JSON.stringify(attr_val)
                    }
                    if (attr_name === "fav_rooms"){
                        attr_val = (attr_val.length !== 0)
                            ? JSON.stringify(attr_val)
                            : "[]"
                    }
                    localStorage.setItem(attr_name, attr_val)
                }
            });
        })
        .catch(error => {
            console.error('Failed to load settings:', error);
        });
}

export const switchProfile = (newProfileId: string): void => {
    console.log(`Switching to profile: ${newProfileId}`);
    loadProfileToLocalStorage(newProfileId);

    // reset the session flag so startup logic knows it's a new profile
    sessionStorage.removeItem('profileInitialized');

    // restart to apply changes
	// (reloading would be enough, but restarting is cleaner)
    window.electronAPI.restartApp();
};


export const exportCurrentProfile = (): Promise<void> => {
    return window.electronAPI.getAppPreferences()
        .then((prefs) => {
            const profiles: Array<Profile> = prefs["profiles"]
            const currentProfile = localStorage.getItem("current_profile") || "default"
            const profileId = profiles.findIndex(p => p.id == currentProfile)
            if (profileId === -1){
                return;
            }

            Object.keys(profiles[profileId])
            // .filter(
            //     attr_name => !["id", "name", "autosave", "fav_rooms"].includes(attr_name)
            // )
            // get items that are in both localstorage and profile
            .filter(
                attr_name => !["id", "name", "autosave"].includes(attr_name)
            )
            .forEach(attr_name => {
                let attr_value = localStorage.getItem(attr_name)
                if (attr_name == "geo_override"){
                    attr_value = JSON.parse(attr_value)
                }
                if (attr_name == "fav_rooms"){
                    attr_value = JSON.parse(attr_value || "[]")
                }
                profiles[profileId][attr_name] = attr_value
            });
            return window.electronAPI.setAppPreference("profiles", profiles)
        })
        .catch(error => {
            console.error('Failed to load settings:', error);
        });
}

export const initPlayerAuth = (profileId: string): void => {
	window.electronAPI.getAppPreferences()
        .then(prefs => {
            const profiles: Array<Profile> = prefs["profiles"]
            const profileIdx = profiles.findIndex(p => p.id === profileId)
            if (profiles[profileIdx]["player_auth_key"] === null){
                profiles[profileIdx]["player_auth_key"] = localStorage.getItem("player_auth_key")
                console.log('Updating auth');
                window.electronAPI.setAppPreference("profiles", profiles)
            }
        })
		.catch(error => {
            console.error('Failed to load settings:', error);
        });
}

export const removeProfiles = (profileIds: string[]): Promise<void> => {
	return window.electronAPI.getAppPreferences()
        .then(prefs => {
            const profiles = prefs["profiles"]
				.filter((p: Profile) => !profileIds.includes(p.id));
            console.log('Removing profiles', profileIds);
            return window.electronAPI.setAppPreference("profiles", profiles)
        })
		.catch(error => {
            console.error('Failed to load settings:', error);
        });
}

interface ProfileField {
    label: string;
    value: string;
    modified: boolean;
}

function createProfileManagerDialog(profiles: Array<Profile>) {
    if (!document.getElementById('font-awesome-4')) {
        const fa = document.createElement('link');
        fa.id = 'font-awesome-4';
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
        document.head.appendChild(fa);
    }

    const currentProfileId = localStorage.getItem("current_profile")
    let selectedProfileId = currentProfileId;
    const removalSet: Set<string> = new Set();
    const saveSet: Set<string> = new Set();

    // Clean up old style and modal
    const styleId = 'custom-modal-style';
    document.getElementById(styleId)?.remove();
    document.getElementById('custom-modal')?.remove();
    document.getElementById('blur-overlay')?.remove();

    // Create style
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        #custom-modal {
            background-color: #1b2125;
            border: none;
            border-radius: 10px;
            padding: 20px 20px 30px 20px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.5);
            color: white;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            text-align: center;
            opacity: 0;
            transform: scale(0.8) translate(-50%, -50%);
            transition: opacity 0.3s ease, transform 0.3s ease;
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 50%;
            left: 50%;
            overflow: hidden;
            z-index: 10000;
            box-sizing: border-box;
        }
        #profile-list {
            overflow-y: auto;
            margin-bottom: 20px;
            flex-grow: 1;
            min-height: 100px;
        }
        #custom-modal h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: bold;
            text-align: left;
        }
        #custom-modal hr {
            border: none;
            border-top: 3px solid #b2413b;
            margin: 0 0 20px 0;
        }
        .profile-card {
            border: 1px solid #3b5d82;
            border-radius: 5px;
            padding: 10px;
            margin-bottom: 10px;
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 5px;
            position: relative;
        }
        .profile-card button {
            padding: 6px 10px;
            font-size: 15px;
            font-weight: bold;
            border: none;
            border-radius: 5px;
            background-color: #244967;
            color: white;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-top: 5px;
            width: 120px;
        }
        .profile-card button:hover {
            background-color: #3b5d82;
        }
        .button-row {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .delete-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #b2413b;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            display: none;
        }
        .save-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #3b5d82;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            display: none;
        }
        #custom-modal-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        #custom-modal-buttons button {
            padding: 8px 16px;
            font-size: 15px;
            font-weight: bold;
            border: none;
            border-radius: 5px;
            background-color: #244967;
            color: white;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        #custom-modal-buttons button:hover {
            background-color: #3b5d82;
        }
        #custom-modal-close {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            font-weight: bold;
        }
        #custom-modal-close:hover {
            color: #c2cecf;
        }
        #blur-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(5px);
            background: rgba(0, 0, 0, 0.2);
            z-index: 9999;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .profile-field-label {
            font-weight: bold;
        }
        .profile-field-label-mod {
            font-weight: bold;
            color: #67b64f;
        }
        .profile-field-mod {
            color: #67b64f;
        }
        .profile-name {
            font-weight: bold;
            font-size: 20px;
        }
    `;
    document.head.appendChild(style);

    // Create blur overlay
    const overlay = document.createElement('div');
    overlay.id = 'blur-overlay';
    document.body.appendChild(overlay);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'custom-modal';

    const closeBtn = document.createElement('button');
    closeBtn.id = 'custom-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeModal);
    modal.appendChild(closeBtn);

    // Title
    const title = document.createElement('h1');
    title.textContent = 'Manage Profiles';
    modal.appendChild(title);

    // Horizontal rule
    const hr = document.createElement('hr');
    modal.appendChild(hr);

    // === Create New Profile button ===
    const createNewBtn = document.createElement('button');
    createNewBtn.innerHTML = '<i class="fa fa-user-plus" aria-hidden="true"></i> Create New Profile';
    createNewBtn.style.padding = '8px 16px';
    createNewBtn.style.fontSize = '15px';
    createNewBtn.style.fontWeight = 'bold';
    createNewBtn.style.border = 'none';
    createNewBtn.style.borderRadius = '5px';
    createNewBtn.style.backgroundColor = '#244967';
    createNewBtn.style.color = 'white';
    createNewBtn.style.cursor = 'pointer';
    createNewBtn.style.transition = 'background-color 0.2s';
    createNewBtn.style.margin = '0px 0 20px 0'; // spacing
    createNewBtn.addEventListener('mouseover', () => {
        createNewBtn.style.backgroundColor = '#3b5d82';
    });
    createNewBtn.addEventListener('mouseout', () => {
        createNewBtn.style.backgroundColor = '#244967';
    });
    createNewBtn.addEventListener('click', () => {
        closeModal();
        profileNew();
    });
    modal.appendChild(createNewBtn);

    const profileList = document.createElement('div');
    profileList.id = 'profile-list';
    modal.appendChild(profileList);

    const selectButtons = new Map(); // Track select buttons

    profiles.forEach(profile => {
        const card = document.createElement('div');
        card.className = 'profile-card';

        const nameEl = document.createElement('div');
        nameEl.className = "profile-name"
        nameEl.textContent = profile.name;
        card.appendChild(nameEl);

        // this is the ugliest thing i've ever written
        const fields: Array<ProfileField> = [
            {
                label: 'Nickname', 
                value: (currentProfileId === profile.id)
                    ? localStorage.getItem("player_name")
                    : profile.player_name,
                modified: (currentProfileId === profile.id) && profile.player_name !== localStorage.getItem("player_name")
            },
            {
                label: 'Avatar', 
                value: (currentProfileId === profile.id)
                    ? (localStorage.getItem("avatar") || '(no avatar)')
                    : profile.avatar || '(no avatar)',
                modified: (currentProfileId === profile.id) && profile.avatar !== localStorage.getItem("avatar")
            },
            {
                label: 'Extrapolation', 
                value: (currentProfileId === profile.id)
                    ? (localStorage.getItem("extrapolation") || '0')
                    : profile.extrapolation || '0',
                modified: (currentProfileId === profile.id) && (profile.extrapolation || '0') !== (localStorage.getItem("extrapolation") || '0')
            },
            {
                label: 'Location Override', 
                value: (currentProfileId === profile.id)
                    ? (
                        localStorage.getItem("geo_override")
                            ? JSON.parse(localStorage.getItem("geo_override")).code.toUpperCase() 
                            : '(no override)'
                    )
                    : (
                        profile.geo_override 
                            ? profile.geo_override.code.toUpperCase() 
                            : '(no override)'
                    ),
                modified: (currentProfileId === profile.id) && ((profile.geo_override?.code || "") !== ((JSON.parse(localStorage.getItem("geo_override")) || {})?.code || ""))
            },
            {
                label: 'Favorite Rooms', 
                value: (currentProfileId === profile.id)
                    ? (
                        localStorage.getItem("fav_rooms") !== null && localStorage.getItem("fav_rooms") !== "[]" 
                            ? "<br>• " + JSON.parse(localStorage.getItem("fav_rooms")).join("<br>• ")
                            : "(no rooms)"
                    )
                    : (
                        profile.fav_rooms.length !== 0 
                            ? "<br>• " + profile.fav_rooms.join("<br>• ")
                            : "(no rooms)" 
                    ),
                modified: (currentProfileId === profile.id) && (JSON.stringify(profile.fav_rooms) !== String(localStorage.getItem("fav_rooms") || "[]"))
            },
            {
                label: 'Auth', 
                value: (currentProfileId === profile.id)
                    ? localStorage.getItem("player_auth_key").split(".")[1]
                    : profile.player_auth_key.split(".")[1],
                modified: (currentProfileId === profile.id) && (profile.player_auth_key !== localStorage.getItem("player_auth_key"))
            },
            {
                label: 'Autosave',
                value: profile.autosave ? "ON" : "OFF",
                modified: false
            }
        ];

        fields.forEach((pf: ProfileField) => {
            const div = document.createElement('div');
            if (pf.modified){
                div.innerHTML = `
                <span class="profile-field-label-mod">${pf.label}:</span> <span class="profile-field-mod">${pf.value}</span>
                `;
            } else {
                div.innerHTML = `
                <span class="profile-field-label">${pf.label}:</span> ${pf.value}
                `;
            }
            card.appendChild(div);
        });

        // Delete badge
        const deletionBadge = document.createElement('div');
        deletionBadge.className = 'delete-badge';
        deletionBadge.textContent = 'Will be deleted';
        card.appendChild(deletionBadge);

        const saveBadge = document.createElement('div');
        saveBadge.className = 'save-badge';
        saveBadge.textContent = 'Will be saved';
        card.appendChild(saveBadge);

        const buttonRow = document.createElement('div');
        buttonRow.className = 'button-row';

        // === SELECT BUTTON ===
        const selectBtn = document.createElement('button');
        selectBtn.textContent = (currentProfileId === profile.id) ? 'Selected' : 'Select';

        function styleSelectBtn(btn: HTMLButtonElement, isSelected: boolean) {
            if (isSelected) {
                btn.textContent = 'Selected';
                btn.style.backgroundColor = '#559742';
                btn.style.color = 'white';
            } else {
                btn.textContent = 'Select';
                btn.style.backgroundColor = '#244967';
                btn.style.color = 'white';
            }
        }

        const isSelected = [selectedProfileId, currentProfileId].includes(profile.id);
        styleSelectBtn(selectBtn, isSelected);

        selectBtn.addEventListener('click', () => {
            selectedProfileId = profile.id;
            selectButtons.forEach((btn, pid) => {
                styleSelectBtn(btn, pid === profile.id);
            });
        });
        buttonRow.appendChild(selectBtn);
        selectButtons.set(profile.id, selectBtn);

        // === SAVE BUTTON ===
        if (profile.id === currentProfileId) {
            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save Profile';
            saveBtn.addEventListener('click', () => {
                const isMarked = saveSet.has(profile.id);
                if (isMarked) {
                    saveSet.delete(profile.id);
                    saveBtn.textContent = 'Save Profile';
                    saveBadge.style.display = 'none';
                } else {
                    saveSet.add(profile.id);
                    saveBtn.textContent = "Undo Save";
                    saveBadge.style.display = 'block';
                }
            });
            buttonRow.appendChild(saveBtn);
        }

        // === REMOVE BUTTON ===
        if (profile.id !== 'default') {
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Delete';
            removeBtn.addEventListener('click', () => {
                const isMarked = removalSet.has(profile.id);
                if (isMarked) {
                    removalSet.delete(profile.id);
                    removeBtn.textContent = 'Delete';
                    deletionBadge.style.display = 'none';
                } else {
                    removalSet.add(profile.id);
                    removeBtn.textContent = 'Undo Delete';
                    deletionBadge.style.display = 'block';
                }
            });
            buttonRow.appendChild(removeBtn);
        }

        card.appendChild(buttonRow);
        profileList.appendChild(card);
    });

    const modalButtons = document.createElement('div');
    modalButtons.id = 'custom-modal-buttons';

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply Changes';
    applyBtn.addEventListener('click', async () => {
        console.log('Selected Profile:', selectedProfileId);
        console.log('Profiles to save:', Array.from(saveSet));
        console.log('Profiles to remove:', Array.from(removalSet));

        // save profile
        if (Array.from(saveSet).length !== 0){
           await exportCurrentProfile();
        }

        if (Array.from(removalSet).length !== 0){
            await removeProfiles(Array.from(removalSet));
        }

        // if you delete the currently selected profile,
        // then switch to the default one
        if (Array.from(removalSet).includes(selectedProfileId)){
            selectedProfileId = "default"
        }
        closeModal();

        // only reload the app if a different profile has been selected
        if (selectedProfileId !== currentProfileId){
            customAlert(
                "Changes applied!", 
                "The app will restart in a few seconds (or do it manually)...", 
                []
            )
            setTimeout(() => switchProfile(selectedProfileId), 4000)
        }
    });
    modalButtons.appendChild(applyBtn);

    modal.appendChild(modalButtons);
    document.body.appendChild(modal);

    // Animate in
    overlay.style.display = 'block';
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1) translate(-50%, -50%)';
    });

    function closeModal() {
        overlay.style.opacity = '0';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.8) translate(-50%, -50%)';
        modal.remove();
        overlay.remove();
    }
}

const profileNew = async (): Promise<void> => {
    const prefs = await window.electronAPI.getAppPreferences();
    const profiles: Array<Profile> = prefs["profiles"];

    const commandInput = document.getElementById("commandline") as HTMLInputElement;
    const restartButton = document.createElement('button');
    restartButton.innerText = 'Create Profile';
    restartButton.disabled = true;

    // === Restart button styles ===
    restartButton.style.backgroundColor = '#3e3e3e';
    restartButton.style.cursor = 'not-allowed';
    restartButton.style.color = 'white';
    restartButton.style.padding = '8px 16px';
    restartButton.style.fontSize = '14px';
    restartButton.style.fontWeight = 'bold';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.transition = 'background-color 0.2s';

    restartButton.addEventListener('mouseenter', () => {
        if (!restartButton.disabled) {
            restartButton.style.backgroundColor = '#3b5d82';
        }
    });
    restartButton.addEventListener('mouseleave', () => {
        if (!restartButton.disabled) {
            restartButton.style.backgroundColor = '#244967';
        }
    });

    const newProfile: Profile = {
        id: null,
        name: null,
        autosave: true,
        avatar: null,
        extrapolation: null,
        fav_rooms: [],
        geo_override: null,
        player_name: null,
        player_auth_key: null
    };

    const createLabelInput = (id: string, labelText: string, placeholder: string) => {
        const box = document.createElement('div');
        box.className = 'label-input';
        box.style.display = 'flex';
        box.style.backgroundColor = '#244967';
        box.style.alignItems = 'baseline';
        box.style.borderRadius = '5px';
        box.style.padding = '3px 3px 3px 5px';
        box.style.marginBottom = '15px';

        const label = document.createElement('label');
        label.textContent = labelText;
        label.style.marginRight = '8px';

        const input = document.createElement('input');
        input.id = id;
        input.placeholder = placeholder;
        input.type = 'text';
        input.maxLength = 25;
        input.style.flex = '1';
        input.style.padding = '3px';
        input.style.paddingLeft = '6px';
        input.style.border = 'none';
        input.style.borderRadius = '5px';
        input.style.background = '#1b2125';
        input.style.color = 'white';
        input.style.fontSize = '14px';
        input.style.width = '10ch';
        input.style.outline = 'none';

        box.appendChild(label);
        box.appendChild(input);
        return { box, input };
    };

    const { box: nameBox, input: nameInput } = createLabelInput(
        'profile-name-input',
        'Profile name:',
        'Enter a profile name'
    );

    const { box: nicknameBox, input: nicknameInput } = createLabelInput(
        'nickname-input',
        'Nick:',
        'Choose a nickname (can be modified later)'
    );

    // === Utility: Create toggle group ===
    const createToggleGroup = (labelText: string, options: string[], defaultOption: string, onChange: (selected: string) => void) => {
        const applyHoverEffect = (btn: HTMLButtonElement) => {
            btn.addEventListener('mouseenter', () => {
                if (!btn.disabled) {
                    if (btn.dataset.active === 'true') {
                        // Keep background for active button
                        btn.style.backgroundColor = '#3b5d82';
                    } else {
                        // Only change text color for inactive button
                        btn.style.color = 'white';
                    }
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (!btn.disabled) {
                    if (btn.dataset.active === 'true') {
                        // Restore active background when leaving
                        btn.style.backgroundColor = '#244967';
                        btn.style.color = 'white';
                    } else {
                        // Restore inactive color and text
                        btn.style.backgroundColor = '#1b2125';
                        btn.style.color = '#aaa';
                    }
                }
            });
        };

        const container = document.createElement('div');
        container.style.marginBottom = '15px';
    
        const label = document.createElement('div');
        label.textContent = labelText;
        label.style.marginBottom = '5px';
        label.style.fontWeight = 'bold';
        container.appendChild(label);
    
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
    
        const buttonsMap: Record<string, HTMLButtonElement> = {};
    
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.textContent = option;
            btn.style.flex = '1';
            btn.style.padding = '8px 16px';
            btn.style.fontSize = '14px';
            btn.style.fontWeight = 'bold';
            btn.style.border = 'none';
            btn.style.borderRadius = '5px';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'background-color 0.2s, color 0.2s';
    
            const setActive = (isActive: boolean) => {
                btn.style.backgroundColor = isActive ? '#244967' : '#1b2125';
                btn.style.color = isActive ? 'white' : '#aaa';
                btn.dataset.active = isActive ? 'true' : 'false'; 
            };
    
            btn.addEventListener('click', () => {
                Object.entries(buttonsMap).forEach(([opt, b]) => {
                    const isActive = opt === option;
                    const setActive = (active: boolean) => {
                        b.style.backgroundColor = active ? '#244967' : '#1b2125';
                        b.style.color = active ? 'white' : '#aaa';
                        b.dataset.active = active ? 'true' : 'false';
                    };
                    setActive(isActive);
                });
                onChange(option);
            });
    
            // Initialize button state
            if (option === defaultOption) {
                setActive(true);
            } else {
                setActive(false);
            }

            applyHoverEffect(btn)
    
            buttonsMap[option] = btn;
            buttonContainer.appendChild(btn);
        });
    
        container.appendChild(buttonContainer);
        return container;
    };

    const autosaveToggle = createToggleGroup(
        'Autosave',
        ['ON', 'OFF'],
        'ON',
        (selected) => {
            newProfile.autosave = selected === 'ON';
        }
    );

    const authToggle = createToggleGroup(
        'Auth',
        ['New Identity', 'Current Identity'],
        'New Identity',
        (selected) => {
            if (selected === 'Current Identity') {
                newProfile.player_auth_key = localStorage.getItem("player_auth_key");
            } else {
                newProfile.player_auth_key = null;
            }
        }
    );

    // === Button logic ===
    const checkInputs = () => {
        const profileNameValue = nameInput.value.trim();
        const nicknameValue = nicknameInput.value;//.trim();

        const exists = profiles.some(p => p.id === profileNameValue.toLowerCase().replace(/\s+/g, '-'));

        if (profileNameValue.length === 0 || nicknameValue.length === 0 || exists) {
            restartButton.disabled = true;
            restartButton.style.backgroundColor = '#3e3e3e';
            restartButton.style.cursor = 'not-allowed';
            if (exists && profileNameValue.length > 0) {
                nameInput.style.color = '#b2413b';
            } else {
                nameInput.style.color = 'white';
            }
        } else {
            restartButton.disabled = false;
            restartButton.style.backgroundColor = '#244967';
            restartButton.style.cursor = 'pointer';
            nameInput.style.color = 'white';
        }
    };

    nameInput.addEventListener('input', checkInputs);
    nameInput.addEventListener('keydown', checkInputs);
    nicknameInput.addEventListener('input', checkInputs);

    restartButton.onclick = () => {
        const profileNameValue = nameInput.value.trim();
        const nicknameValue = nicknameInput.value;

        const newProfileId = profileNameValue.toLowerCase().replace(/\s+/g, '-');
        newProfile.id = newProfileId;
        newProfile.name = profileNameValue;
        newProfile.player_name = nicknameValue;

        profiles.push(newProfile);

        // if we create this new profile before even closing the app the first time, 
        // we leave the "default" profile with player_name: null
        // so before saving the new profile, we make sure to also update default
        // with the current nickname being used
        const defaultProfileIdx = profiles.findIndex(p => p.id === "default");
        if (profiles[defaultProfileIdx].player_name === null) {
            profiles[defaultProfileIdx].player_name = localStorage.getItem("player_name");
        }
        window.electronAPI.setAppPreference('profiles', profiles);

        customAlert(
            "New profile created!",
            "The app will restart in a few seconds (or do it manually)...",
            []
        )
        setTimeout(() => switchProfile(newProfileId), 4000)
    };

    // === Alert setup ===
    customAlert(
        "New Profile",
        `You're creating a new profile.

        This profile will have its own
        • Nickname
        • Auth
        • Avatar
        • Extrapolation
        • Location override
        • Favorite rooms

        Autosave option:
        • With Autosave ON, changes to the current profile will be saved when you close the app
        • With Autosave OFF, changes won't be automatically saved

        Identity option:
        • With "New Identity", a new auth will be generated for this profile
        • Wtih "Current Identity", the same auth of the profile you're currently on will be used 

        If the profile creation is successful, the app will restart with the new profile selected.

        <div id="profile-creation-container"></div>`,
        [restartButton]
    );

    // Insert UI after alert renders
    setTimeout(() => {
        const container = document.querySelector('#profile-creation-container');
        if (container) {
            container.appendChild(nameBox);
            container.appendChild(nicknameBox);
            container.appendChild(autosaveToggle);
            container.appendChild(authToggle);
        }
    }, 0);

    setTimeout(() => {
        commandInput.placeholder = "Enter a command";
    }, 3000);
};

export const profileManage = (): void => {
    window.electronAPI.getAppPreferences()
        .then(prefs => {
            const profiles: Array<Profile> = prefs["profiles"]
            createProfileManagerDialog(profiles)
        })
}
