import { customAlert } from "./alerts";
import { createButton } from "./utils";

export const shortcutNewDialog = async (): Promise<void> => {
	if (!document.getElementById('font-awesome-4')) {
        const fa = document.createElement('link');
        fa.id = 'font-awesome-4';
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
        document.head.appendChild(fa);
    }

	const createStyledInput = (placeholder: string): HTMLInputElement => {
		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = placeholder;
		input.maxLength = 137;
		input.style.flex = '1';
		input.style.padding = '3px';
		input.style.paddingLeft = '6px';
		input.style.border = 'none';
		input.style.borderRadius = '5px';
		input.style.background = '#1b2125';
		input.style.color = 'white';
		input.style.fontSize = '13px';
		input.style.width = '100%';
		input.style.outline = 'none';
		input.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.15)';
		return input;
	};

	const prefs = await window.electronAPI.getAppPreferences();
	let existingShortcuts = prefs["shortcuts"].flat();

	const container = document.createElement('div');
	container.id = 'shortcut-create-container';
	container.style.display = 'flex';
	container.style.flexDirection = 'column';
	container.style.gap = '20px';

	const inputRow = document.createElement('div');
	inputRow.style.display = 'flex';
	inputRow.style.gap = '10px';

	const inputLeft = createStyledInput('What you type here...');
	const inputRight = createStyledInput('...turns into what you type here');
	
	const arrowIcon = document.createElement('i');
	arrowIcon.className = 'fa fa-arrow-right';
	arrowIcon.style.alignSelf = 'center';
	arrowIcon.style.margin = '0 8px';
	arrowIcon.style.fontSize = '16px';
	arrowIcon.style.fontStyle = 'normal';

	inputRow.appendChild(inputLeft);
	inputRow.appendChild(arrowIcon);
	inputRow.appendChild(inputRight);

	const defaultButtonText = 'Save shortcut'
	const confirmButton = document.createElement('button');
	confirmButton.textContent = defaultButtonText;
	confirmButton.disabled = true;
	confirmButton.style.flex = '1';
	confirmButton.style.padding = '8px 0';
	confirmButton.style.fontSize = '14px';
	confirmButton.style.fontWeight = 'bold';
	confirmButton.style.border = 'none';
	confirmButton.style.borderRadius = '5px';
	confirmButton.style.cursor = 'not-allowed';
	confirmButton.style.transition = 'background-color 0.2s';
	confirmButton.style.backgroundColor = '#3e3e3e';
	confirmButton.style.color = 'white';

	const checkInputs = async () => {
		const bothWritten = inputLeft.value.trim() && inputRight.value.trimStart();
		const neitherExisting = !existingShortcuts.includes(inputLeft.value.trim()) && !existingShortcuts.includes(inputRight.value.trimStart());
		const areDifferent = inputLeft.value.trim() !== inputRight.value.trimStart();
		const isValid = bothWritten && neitherExisting && areDifferent;
		confirmButton.disabled = !isValid;
		confirmButton.style.cursor = isValid ? 'pointer' : 'not-allowed';
		confirmButton.style.backgroundColor = isValid ? '#244967' : '#3e3e3e';
	};

	confirmButton.addEventListener('mouseenter', () => {
		if (!confirmButton.disabled) {
			confirmButton.style.backgroundColor = '#2e5c87';
		}
	});

	confirmButton.addEventListener('mouseleave', () => {
		if (!confirmButton.disabled) {
			confirmButton.style.backgroundColor = '#244967';
		}
	});

	confirmButton.addEventListener('click', async () => {
		if (confirmButton.disabled) return;

		const shortcuts = prefs["shortcuts"];
		shortcuts.push([
			inputLeft.value.trim(), inputRight.value.trimStart()
		]);
		existingShortcuts = shortcuts.flat()

		await window.electronAPI.setAppPreference("shortcuts", shortcuts)

		inputLeft.value = ""
		inputRight.value = ""

		confirmButton.textContent = 'Shortcut saved!';
		confirmButton.style.backgroundColor = '#67b64f';
		confirmButton.disabled = true;

		setTimeout(() => {
			confirmButton.textContent = defaultButtonText;
			confirmButton.style.backgroundColor = "#3e3e3e";
		}, 3000);
	});

	inputLeft.addEventListener('input', checkInputs);
	inputRight.addEventListener('input', checkInputs);

	container.appendChild(inputRow);

	customAlert(
		"New shortcut",
		`Create a text shortcut that expands when written in chat.
		
		<div id="shortcut-dialog-body"></div>`,
		[confirmButton]
	);

	setTimeout(() => {
		const el = document.querySelector('#shortcut-dialog-body');
		if (el) el.appendChild(container);
	}, 0);
};

export const shortcutListDialog = async (): Promise<void> => {
	const prefs = await window.electronAPI.getAppPreferences();
	const shortcuts: [string, string][] = prefs["shortcuts"];

	const container = document.createElement('div');
	container.style.display = 'flex';
	container.style.flexDirection = 'column';
	container.style.gap = '12px';
	container.style.alignItems = 'center';

	const renderShortcuts = () => {
		container.innerHTML = '';

		shortcuts.forEach(([input, output], index) => {
			const row = document.createElement('div');
			row.style.display = 'flex';
			row.style.alignItems = 'center';
			row.style.justifyContent = 'space-between';
			row.style.width = '100%';

			// Centered group: input -> arrow -> output
			const centerGroup = document.createElement('div');
			centerGroup.style.display = 'flex';
			centerGroup.style.alignItems = 'center';
			centerGroup.style.gap = '8px';
			centerGroup.style.margin = '0 auto';

			const sharedBoxStyle = {
				background: '#1b2125',
				color: 'white',
				fontSize: '13px',
				borderRadius: '5px',
				padding: '4px 6px',
				overflowX: 'auto',
				whiteSpace: 'nowrap',
				boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
				width: '200px', // fixed size
				flexShrink: '0'
			};

			const inputBox = document.createElement('div');
			inputBox.textContent = input;
			Object.assign(inputBox.style, sharedBoxStyle);

			const outputBox = document.createElement('div');
			outputBox.textContent = output;
			Object.assign(outputBox.style, sharedBoxStyle);

			const arrow = document.createElement('i');
			arrow.className = 'fa fa-arrow-right';
			arrow.style.fontSize = '14px';
			arrow.style.fontStyle = 'normal';
			arrow.style.color = 'white';

			centerGroup.appendChild(inputBox);
			centerGroup.appendChild(arrow);
			centerGroup.appendChild(outputBox);
			
			const deleteBtn = document.createElement('button');
			deleteBtn.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';

			const icon = deleteBtn.querySelector('i') as HTMLElement;
			icon.style.fontStyle = 'normal';
			deleteBtn.style.background = 'transparent';
			deleteBtn.style.border = 'none';
			deleteBtn.style.color = '#999';
			deleteBtn.style.cursor = 'pointer';
			deleteBtn.style.fontSize = '14px';
			deleteBtn.style.width = '24px';
			deleteBtn.style.height = '24px';
			deleteBtn.style.borderRadius = '4px';
			deleteBtn.style.transition = 'background 0.2s';

			deleteBtn.addEventListener('mouseenter', () => {
				deleteBtn.style.background = '#333';
				deleteBtn.style.color = '#f55';
			});
			deleteBtn.addEventListener('mouseleave', () => {
				deleteBtn.style.background = 'transparent';
				deleteBtn.style.color = '#999';
			});
			deleteBtn.addEventListener('click', async () => {
				shortcuts.splice(index, 1);
				await window.electronAPI.setAppPreference("shortcuts", shortcuts)
				renderShortcuts();
			});

			row.appendChild(centerGroup);
			row.appendChild(deleteBtn);
			container.appendChild(row);
		});
	};

	renderShortcuts();

	const createShortcutButton = createButton("Create a new shortcut", "#244967", "#3b5d82", () => {
		shortcutNewDialog();
	})

	if (shortcuts.length > 0){
		customAlert(
			"Your shortcuts",
			`<div id="shortcut-list-body"></div>`,
			[createShortcutButton]
		);
	
		setTimeout(() => {
			const el = document.querySelector('#shortcut-list-body') as HTMLElement;
			if (el) {
				el.appendChild(container);
				el.style.maxHeight = '300px';
				el.style.overflowY = 'auto';
				el.style.paddingLeft = '0';
			}
		}, 0);
	} else {
		customAlert(
			"Your shortcuts",
			`You haven't saved any shortcuts!`,
			[createShortcutButton]
		);
	}
};