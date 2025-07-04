import { customAlert } from "./alerts";
import { createButton } from "./utils";
import { Profile } from "./profiles"

export const authShowAlert = (publicAuth: string, privateKey: string) => {
	const publicAuthButton = document.createElement('button');
	publicAuthButton.id = "copy-public-auth-button"
	publicAuthButton.textContent = 'Copy Public Auth';

	publicAuthButton.addEventListener("click", () => {
		navigator.clipboard.writeText(publicAuth)
			.then(() => {
				console.log("Copied to clipboard!");
				publicAuthButton.textContent = "Copied to clipboard!";
				setTimeout(() => publicAuthButton.textContent = "Copy Public Auth", 2000);
			})
			.catch(err => {
				console.error("Failed to copy: ", err);
			});
	});

	const privateKeyButton = document.createElement('button');
	privateKeyButton.id = "copy-private-key-button"
	privateKeyButton.textContent = 'Copy Private Key';

	privateKeyButton.addEventListener("click", () => {
		navigator.clipboard.writeText(privateKey)
			.then(() => {
				console.log("Copied to clipboard!");
				privateKeyButton.textContent = "Copied to clipboard!";
				setTimeout(() => privateKeyButton.textContent = "Copy Private Key", 2000);
			})
			.catch(err => {
				console.error("Failed to copy: ", err);
			});
	});

	customAlert(
		"Auth",
		`Your public auth is used by room administrators to identify you when you join their room.

		Your private key is only visible to you and can be used to change your public auth. 
		
		Be careful! If someone discovered your private key, they could use it to impersonate you.

		<b>Public auth</b>
		${publicAuth}

		<b>Private key</b>
		idkey.${publicAuth}.[hidden]`,
		[publicAuthButton, privateKeyButton]
	)
}

export const resetAuthAlert = (): void => {
	const resetAuthButton = createButton(
		"Confirm Reset",
		"#b2413b", "#D04D46",
		async () => {
			const prefs = await window.electronAPI.getAppPreferences();
			const profiles = prefs["profiles"];
			const newAuth = await window.electronAPI.generatePlayerAuthKey();

			const currentProfileIdx = profiles.findIndex(
				(p: Profile) => p.id === localStorage.getItem("current_profile")
			);
			if (currentProfileIdx !== -1) {
				profiles[currentProfileIdx].player_auth_key = newAuth;
			}

			await window.electronAPI.setAppPreference('profiles', profiles);
			localStorage.setItem("player_auth_key", newAuth);

			customAlert(
				"Reset successful", 
				"The page will reload in a few seconds.", 
				[]
			)
			setTimeout(() => window.location.reload(), 4000)
		}
	)

	customAlert(
		"Are you sure?",
		`By resetting your auth you may lose your identity in public rooms.`,
		[resetAuthButton]
	)
}

export const authNewDialog = (): void => {
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
        input.maxLength = 137;
        input.style.flex = '1';
        input.style.padding = '3px';
        input.style.paddingLeft = '6px';
        input.style.border = 'none';
        input.style.borderRadius = '5px';
        input.style.background = '#1b2125';
        input.style.color = 'white';
        input.style.fontSize = '13px';
        input.style.width = '10ch';
        input.style.outline = 'none';

        box.appendChild(label);
        box.appendChild(input);
        return { box, input };
    };

	const changeButton = document.createElement('button');
    changeButton.innerText = 'Apply New Auth';
    changeButton.disabled = true;
    changeButton.style.backgroundColor = '#3e3e3e';
    changeButton.style.cursor = 'not-allowed';
    changeButton.style.color = 'white';
    changeButton.style.padding = '8px 16px';
    changeButton.style.fontSize = '14px';
    changeButton.style.fontWeight = 'bold';
    changeButton.style.border = 'none';
    changeButton.style.borderRadius = '5px';
    changeButton.style.transition = 'background-color 0.2s';

	const { box: idkeyBox, input: idkeyInput } = createLabelInput(
        'idkey-input',
        'Private Key:',
        "If the text turns red, you are copying the wrong thing"
    );
	
	const checkInput = () => {
		const idkey = idkeyInput.value.trim();
		const pattern = /^idkey\.([A-Za-z0-9_-]{43})\.([A-Za-z0-9_-]{43})\.([A-Za-z0-9_-]{43})$/;
		const isValid = pattern.test(idkey)

        if (isValid) {
			changeButton.disabled = false;
            changeButton.style.backgroundColor = '#244967';
            changeButton.style.cursor = 'pointer';
            idkeyInput.style.color = 'white';
        } else {
            changeButton.disabled = true;
            changeButton.style.backgroundColor = '#3e3e3e';
            changeButton.style.cursor = 'not-allowed';
            idkeyInput.style.color = '#b2413b';
        }
    };

    idkeyInput.addEventListener('input', checkInput);
    idkeyInput.addEventListener('keydown', checkInput);

	changeButton.addEventListener("click", () => {
		const idkey = idkeyInput.value.trim();
		localStorage.setItem("player_auth_key", idkey);
		customAlert(
			"Auth changed", 
			"The page will reload in a few seconds.", 
			[]
		)
		setTimeout(() => window.location.reload(), 4000)
	})

	// === Alert setup ===
    customAlert(
        "Change Auth",
        `You can use a different auth by entering its private key below.

		For example, if you previously used a different browser or device, you can restore your old identity by visiting:
		
		<a target="_blank" href=https://haxball.com/playerauth>https://haxball.com/playerauth</a>

		Copy the Private Key from that page and paste it into the box below.

        <div id="auth-change-container"></div>`,
        [changeButton]
    );

    // Insert UI after alert renders
    setTimeout(() => {
        const container = document.querySelector('#auth-change-container');
        if (container) {
            container.appendChild(idkeyBox);
        }
    }, 0);
}