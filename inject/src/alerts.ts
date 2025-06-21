import { URL } from "./constants";
import { loadProfileToLocalStorage } from "./profiles";

export const customAlert = (title: String, message: String, buttons: Array<HTMLButtonElement> = []): void => {
    // Inject styles only once
    if (!document.getElementById('custom-alert-style')) {
        const style = document.createElement('style');
        style.id = 'custom-alert-style';
        style.innerHTML = `
                dialog#custom-alert {
                    background-color: #1b2125;
                    border: none;
                    border-radius: 10px;
                    padding: 20px 20px 30px 20px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.5);
                    color: white;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    transform: scale(0.8);
                    opacity: 0;
                }
                dialog#custom-alert::backdrop {
                    background: transparent;
                }
                #custom-alert h1 {
                    margin: 0 0 10px 0;
                    font-size: 24px;
                    font-weight: bold;
                    text-align: left; /* Left aligned */
                }
                #custom-alert hr {
                    border: none;
                    border-top: 3px solid #b2413b;
                    margin: 0 0 20px 0;
                }
                #custom-alert-message {
                    font-size: 15px;
                    margin-bottom: 20px;
                    text-align: left;
                }
                #custom-alert-message a {
                    color: #ffe7cc; /* Default color for the link */
                }
                #custom-alert-message b, #custom-alert-message strong {
                    font-weight: bold;
                }
                
                #custom-alert-message i {
                    font-style: italic;
                }

                #custom-alert-message a:hover {
                    color: #ffe7cc;
                    text-decoration: underline;
                    transition: text-decoration 0.2s ease;
                }
                #custom-alert-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                #custom-alert-buttons button {
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
                #custom-alert-buttons button:hover {
                    background-color: #3b5d82;
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
                    opacity: 0; /* Make sure this is here */
                    transition: opacity 0.3s ease; /* Add this if missing */
                }
                #custom-alert-close {
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
                #custom-alert-close:hover {
                    color: #c2cecf;
                }
            `;
        document.head.appendChild(style);
    }

    // Create blur overlay if not exists
    let blurOverlay = document.getElementById('blur-overlay');
    if (!blurOverlay) {
        blurOverlay = document.createElement('div');
        blurOverlay.id = 'blur-overlay';
        document.body.appendChild(blurOverlay);
    }

    // Remove existing alert if needed
    let existingDialog = document.getElementById('custom-alert');
    if (existingDialog) {
        existingDialog.remove();
    }

    // Create dialog
    const dialog = document.createElement('dialog');
    dialog.id = 'custom-alert';
    dialog.innerHTML = `
            <button id="custom-alert-close">&times;</button>
            <h1>${title}</h1>
            <hr>
            <div id="custom-alert-message"></div>
            <div id="custom-alert-buttons"></div>
        `;
    const messageContainer = dialog.querySelector('#custom-alert-message');
    messageContainer.innerHTML = message.replace(/\n/g, "<br>");
    document.body.appendChild(dialog);

    // Add buttons
    const buttonContainer = dialog.querySelector('#custom-alert-buttons');
    buttons.forEach(btn => buttonContainer!.appendChild(btn));

    // Show blur and lock scroll
    blurOverlay.style.display = 'block';
    requestAnimationFrame(() => {
        blurOverlay.style.opacity = '1'; // Fade in blur
    });
    document.body.style.overflow = 'hidden'; // LOCK SCROLL

    // Show dialog
    dialog.showModal();

    // Animate bounce open
    requestAnimationFrame(() => {
        dialog.style.opacity = '1';
        dialog.style.transform = 'scale(1)';
    });

    // Close button behavior
    const closeButton = document.getElementById('custom-alert-close');
    closeButton!.onclick = () => {
        closeCustomAlert();
    };

    dialog.addEventListener('close', () => {
        closeCustomAlert();
    });
}

const closeCustomAlert = (): void => {
    const dialog = document.getElementById('custom-alert') as HTMLDialogElement;
    const blurOverlay = document.getElementById('blur-overlay');

    if (!dialog) return;

    // Start fading out blur immediately
    if (blurOverlay) {
        blurOverlay.style.opacity = '0'; // Fade out now
        setTimeout(() => {
            blurOverlay.style.display = 'none'; // Fully hide after fade out
        }, 300); // Match CSS transition time
    }

    // Animate dialog fade out
    dialog.style.opacity = '0';
    dialog.style.transform = 'scale(0.8)';

    setTimeout(() => {
        dialog.close();
        dialog.remove();

        document.body.style.overflow = ''; // UNLOCK SCROLL
    }, 300); // Matches dialog fade out
};

export const newVersionAlert = (latest): void => {
    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'Download now';
    downloadButton.onclick = () => {
        console.log('Download clicked');
        window.location.href = latest.url.standard
        closeCustomAlert();
    };
    customAlert(
        `Changelog ${latest.version} (${latest.date})`,
        latest.notes,
        [downloadButton]
    )
}

export const aboutAlert = (): void => {
    customAlert(
        "About",
        `This app was developed by <b>@og9525</b> to improve the HaxBall experience, while keeping it faithful to the original.

        Unlike similar projects, it is open source and downloadable without any registration.

        Thank you for checking it out!

        Make sure you only download this app from the official website:
        <a target="_blank" href=${URL.website}>${URL.website}</a>

        Join the official Discord server:
        <a target="_blank" href=${URL.discord}/>${URL.discord}</a>

        <b>Credits</b>
        • <a target="_blank" href=https://github.com/electron/electron>Electron</a>, for making this app's creation easy
        • <a target="_blank" href=https://github.com/xenonsb/Haxball-Room-Extension>All-in-one Tool</a>, for improving HaxBall and open sourcing their code`,
        []
    );
}

export const helpAlert = (): void => {
    const officialWebsiteButton = document.createElement('button');
    officialWebsiteButton.innerText = 'Website';
    officialWebsiteButton.onclick = () => {
        window.open(URL.website, "_blank");
    };

    const discordButton = document.createElement('button');
    discordButton.innerText = 'Discord';
    discordButton.onclick = () => {
        window.open(URL.discord, "_blank");
    };

    customAlert(
        "Help",
        `Visit the official website or our Discord server.
        `,
        [officialWebsiteButton, discordButton]
    )
}

export const fpsAlert = (unlock: boolean) => {
    const restartButton = document.createElement('button');
    restartButton.innerText = 'Restart now';
    restartButton.onclick = () => {
        window.electronAPI.restartApp();
    };

    if (unlock){
        customAlert(
            "FPS Limit",
            `<b>FPS unlocked.</b>\n\nThe app will now run without frame rate limits.\n\nRestart the app for changes to apply.`,
            [restartButton]
        );
    } else {
        customAlert(
            "FPS Limit",
            `<b>FPS limit restored.</b>\n\nThe app will now cap FPS to your monitor's refresh rate.\n\nRestart the app for changes to apply.`,
            [restartButton]
        );   
    }
}

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

export const resetPreferencesAlert = (): void => {
    const resetButton = document.createElement('button');
    resetButton.id = "reset-button"
    resetButton.textContent = 'Confirm Reset';
    resetButton.style.backgroundColor = "#b2413b";

    resetButton.addEventListener("click", () => {
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
    })

    customAlert(
        "Are you sure?",
        `This operation will reset the app and delete all your settings.`,
        [resetButton]
    )
}

export const preferencesAlert = (): void => {
    const exportBackupButton = document.createElement('button');
    exportBackupButton.id = "export-backup-button"
    exportBackupButton.textContent = 'Export Backup';

    exportBackupButton.addEventListener("click", () => {
        window.electronAPI.exportPreferencesFile()
            .then(result => {
                if (result.success) {
                    exportBackupButton.textContent = "Exported!";
                    setTimeout(() => exportBackupButton.textContent = "Export Backup", 2000);
                }
            })
    });

    const importBackupButton = document.createElement('button');
    importBackupButton.id = "import-backup-button"
    importBackupButton.textContent = 'Restore Backup';

    importBackupButton.addEventListener("click", () => {
        window.electronAPI.importPreferencesFile()
            .then(result => {
                if (result.success) {
                    customAlert(
                        "Backup restored",
                        "The app will restart in a few seconds (or do it manually)...",
                        []
                    )
                    loadProfileToLocalStorage("default")
                    
                    setTimeout(() => window.electronAPI.restartApp(), 4000);
                } else {
                    importBackupButton.textContent = "Invalid backup!";
                    importBackupButton.disabled = true;
                    importBackupButton.style.backgroundColor = "#b2413b";
                    setTimeout(() => {
                        importBackupButton.textContent = "Restore Backup"
                        importBackupButton.style.backgroundColor = "#244967";
                    }, 2000);
                }
            })
    });

    const resetButton = document.createElement('button');
    resetButton.id = "reset-button"
    resetButton.textContent = 'Reset All';

    resetButton.addEventListener("click", () => {
        resetPreferencesAlert();
    })

    customAlert(
        "Preferences",
        `You can export, restore, or reset all your preferences.
        
        These preferences include your profiles, shortcuts, and notes.
        
        Don't manually edit the preferences file!`,
        [exportBackupButton, importBackupButton, resetButton]
    )
}

// export const firstLaunchAlert = (): void => {
//     customAlert(
//         "Hey!",
//         `It appears this is the first time you launch the client.
        
//         Before using it, here are a few suggestions:
//         • enter '<b>fps unlock</b>' in the command bar if you want to play with <b>unlimited FPS</b>
//         • uncheck '<b>Hide Navbar by default</b>' in the Add-on settings, to avoid the header bar automatically hiding
//         • join our <a target="_blank" href=${URL.discord}/>Discord server</a>!
        
//         Thank you for downloading the client!
//         `,
//         []
//     )
// }