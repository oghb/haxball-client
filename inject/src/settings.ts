import { customAlert } from "./alerts";
import { authNewDialog, authShowAlert, resetAuthAlert } from "./auth";
import { loadProfileToLocalStorage } from "./profiles";
import { createButton } from "./utils";

const createToggleRow = (
		labelText: string,
		options: string[],
		defaultOption: string,
		onChange: (selected: string) => void
	): HTMLDivElement => {
		const row = document.createElement('div');
		row.style.display = 'flex';
		row.style.justifyContent = 'space-between';
		row.style.alignItems = 'center';
		row.style.marginBottom = '15px';
		row.style.gap = '12px';

		const label = document.createElement('div');
		label.textContent = labelText;
		label.style.flex = '0 0 180px';
		label.style.fontWeight = 'bold';

		const buttonGroup = document.createElement('div');
		buttonGroup.style.display = 'flex';
		buttonGroup.style.gap = '10px';
		buttonGroup.style.minWidth = '300px';

		const buttonWidth = `${Math.floor(280 / options.length)}px`;

		const buttonsMap: Record<string, HTMLButtonElement> = {};

		options.forEach(option => {
			const btn = document.createElement('button');
			btn.textContent = option;
			btn.style.width = buttonWidth;
			btn.style.padding = '8px 0';
			btn.style.fontSize = '14px';
			btn.style.fontWeight = 'bold';
			btn.style.border = 'none';
			btn.style.borderRadius = '5px';
			btn.style.cursor = 'pointer';
			btn.style.transition = 'background-color 0.2s, color 0.2s';
			btn.style.backgroundColor = '#1b2125';
			btn.style.color = '#aaa';

			const setActive = (isActive: boolean) => {
				btn.style.backgroundColor = isActive ? '#244967' : '#1b2125';
				btn.style.color = isActive ? 'white' : '#aaa';
				btn.dataset.active = isActive ? 'true' : 'false';
			};

			btn.addEventListener('click', () => {
				Object.entries(buttonsMap).forEach(([opt, b]) => {
					const active = opt === option;
					b.style.backgroundColor = active ? '#244967' : '#1b2125';
					b.style.color = active ? 'white' : '#aaa';
					b.dataset.active = active ? 'true' : 'false';
				});
				onChange(option);
			});

			btn.addEventListener('mouseenter', () => {
				if (btn.dataset.active !== 'true'){
					btn.style.color = 'white';
				} else {
					btn.style.backgroundColor = '#3b5d82';
				}
			});
			btn.addEventListener('mouseleave', () => {
				if (btn.dataset.active !== 'true'){
					btn.style.color = '#aaa';
				} else {
					btn.style.backgroundColor = '#244967';
				}
			});

			setActive(option === defaultOption);
			buttonsMap[option] = btn;
			buttonGroup.appendChild(btn);
		});

		row.appendChild(label);
		row.appendChild(buttonGroup);
		return row;
};

const createDivider = (): HTMLHRElement => {
	const divider = document.createElement('hr');
	divider.style.border = 'none';
	divider.style.borderTop = '1px solid #444';
	divider.style.margin = '20px 0';
	return divider;
};

export const resetPreferencesAlert = (): void => {
    const resetButton = createButton(
		"Confirm Reset",
		"#b2413b", "#D04D46",
		() => {
			window.electronAPI.deletePreferencesFile()
				.then(result => {
					if (result){
						// if preferences deleted, also clear localstorage
						localStorage.clear()
						customAlert(
							"Reset successful", 
							"The app will restart in a few seconds (or do it manually)...", 
							[]
						)
						setTimeout(() => window.electronAPI.restartApp(), 4000)
					}
				})
		}
	)

    customAlert(
        "Are you sure?",
        `This operation will reset the app and delete all your settings.`,
        [resetButton]
    )
}


export const openSettingsAlert = async (): Promise<void> => {
	const prefs = await window.electronAPI.getAppPreferences();
	const currentFpsSetting = prefs["fps_unlock"] ? "Unlimited" : "Default";

	// -- General Section --
	const generalSection = document.createElement('div');

	const generalHeader = document.createElement('div');
	generalHeader.textContent = "General";
	generalHeader.style.fontSize = '18px';
	generalHeader.style.fontWeight = 'bold';
	generalHeader.style.marginBottom = '10px';

	const generalNote = document.createElement('div');
	generalNote.textContent = "You must restart the app to apply the new settings!";
	generalNote.style.fontSize = '13px';
	generalNote.style.marginBottom = '15px';
	generalNote.style.color = '#ccc';

	const fpsRow = createToggleRow(
		'FPS', 
		['Default', 'Unlimited'], 
		currentFpsSetting, 
		(selected) => {
			const newFpsSetting = (selected === "Default") ? false : true;
			window.electronAPI.setAppPreference("fps_unlock", newFpsSetting);
		}
	);

	generalSection.appendChild(generalHeader);
	generalSection.appendChild(generalNote);
	generalSection.appendChild(fpsRow);
	generalSection.appendChild(createDivider());

	// -- Auth Section --
	const authSection = document.createElement('div');

	const authHeader = document.createElement('div');
	authHeader.textContent = "Auth";
	authHeader.style.fontSize = '18px';
	authHeader.style.fontWeight = 'bold';
	authHeader.style.marginBottom = '10px';

	const authMessage = document.createElement('div');
	authMessage.textContent = 'Your auth is typically used by room admins to log you in. Here you can view your current auth or change it, for example if you want to recover the room accounts you had on your browser.';
	authMessage.style.fontSize = '13px';
	authMessage.style.marginBottom = '10px';
	authMessage.style.lineHeight = '1.4';
	authMessage.style.color = '#ccc';

	const authActionRow = document.createElement('div');
	authActionRow.style.display = 'flex';
	authActionRow.style.justifyContent = 'space-between';
	authActionRow.style.gap = '10px';

	const viewAuthButton = createButton("View Auth", "#244967", "#3b5d82", () => {
		const player_auth_key = localStorage.getItem("player_auth_key");
		const publicAuth = player_auth_key.split(".")[1]
		const privateKey = player_auth_key
		authShowAlert(publicAuth, privateKey)
	})
	const changeAuthButton = createButton("Change Auth", "#244967", "#3b5d82", () => {
		authNewDialog();
	})
	const resetAuthButton = createButton("Reset Auth", "#b2413b", "#D04D46", () => {
		resetAuthAlert();
	})

	authActionRow.appendChild(viewAuthButton);
	authActionRow.appendChild(changeAuthButton);
	authActionRow.appendChild(resetAuthButton);

	// You can add other content here later.
	authSection.appendChild(authHeader);
	authSection.appendChild(authMessage);
	authSection.appendChild(authActionRow);
	authSection.appendChild(createDivider());

	// -- Backup Section --
	const backupSection = document.createElement('div');

	const backupHeader = document.createElement('div');
	backupHeader.textContent = "Backup & Reset";
	backupHeader.style.fontSize = '18px';
	backupHeader.style.fontWeight = 'bold';
	backupHeader.style.marginBottom = '10px';

	const backupMessage = document.createElement('div');
	backupMessage.textContent = 'You can export or restore a full backup of your settings, including profiles, shortcuts, and notes. Or reset the app completely.';
	backupMessage.style.fontSize = '13px';
	backupMessage.style.marginBottom = '10px';
	backupMessage.style.lineHeight = '1.4';
	backupMessage.style.color = '#ccc';

	const backupActionRow = document.createElement('div');
	backupActionRow.style.display = 'flex';
	backupActionRow.style.justifyContent = 'space-between';
	backupActionRow.style.gap = '10px';

	const exportBackupButton = createButton("Export Backup", "#244967", "#3b5d82", () => {
		window.electronAPI.exportPreferencesFile()
			.then(result => {
				if (result.success) {
					exportBackupButton.textContent = "Exported!";
					setTimeout(() => exportBackupButton.textContent = "Export Backup", 2000);
				}
			});
	});

	const importBackupButton = createButton("Restore Backup", "#244967", "#3b5d82", () => {
		window.electronAPI.importPreferencesFile()
			.then(result => {
				if (result.success) {
					customAlert("Backup restored", "The app will restart in a few seconds (or do it manually)...", []);
					loadProfileToLocalStorage("default");
					setTimeout(() => window.electronAPI.restartApp(), 4000);
				} else {
					importBackupButton.textContent = "Invalid backup!";
					importBackupButton.disabled = true;
					importBackupButton.style.backgroundColor = "#D04D46";
					setTimeout(() => {
						importBackupButton.textContent = "Restore Backup";
						importBackupButton.style.backgroundColor = "#244967";
						importBackupButton.disabled = false;
					}, 2000);
				}
			});
	});

	const resetAppButton = createButton("Reset App", "#b2413b", "#D04D46", () => {
		resetPreferencesAlert();
	});

	backupActionRow.appendChild(exportBackupButton);
	backupActionRow.appendChild(importBackupButton);
	backupActionRow.appendChild(resetAppButton);

	backupSection.appendChild(backupHeader);
	backupSection.appendChild(backupMessage);
	backupSection.appendChild(backupActionRow);

	// -- Combine All Sections --
	const container = document.createElement('div');
	container.appendChild(generalSection);
	container.appendChild(authSection);
	container.appendChild(backupSection);

	// -- Show Alert --
	customAlert('Settings', container, []);
};