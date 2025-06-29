export const customAlert = (title: string, message: string | HTMLElement, buttons: Array<HTMLButtonElement> = []): void => {
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
    if (typeof message === "string") {
        messageContainer.innerHTML = message.replace(/\n/g, "<br>");
    } else {
        messageContainer.innerHTML = ""; // Clear any existing content
        messageContainer.appendChild(message);
    }
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

export const closeCustomAlert = (): void => {
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