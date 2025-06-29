import { closeCustomAlert, customAlert } from "./alerts";
import { URL } from "./constants";

const newVersionAlert = (latest): void => {
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

function getOs() {
    if (navigator.userAgent.indexOf("Windows") !== -1) {
        return "win";
    } else if (navigator.userAgent.indexOf("Macintosh") !== -1) {
        return "macOS";
    } else {
        return "linux";
    }
}

async function checkLatestRelease() {
    const res = await fetch(URL.releases, {
        method: "GET",
        headers: {
            Accept: "application/vnd.github.v3+json",
        },
    });

    const data = await res.json();
    const urls = data[0].assets
        .filter((el) => el.name.indexOf(getOs()) !== -1)
        .map((el) => el.browser_download_url);

    const latest = {
        version: data[0].tag_name,
        url: {
            standard: urls.find((el) => el.indexOf("Lite") === -1),
            lite: urls.find((el) => el.indexOf("Lite") !== -1),
        },
        notes: data[0].body,
        date: data[0].published_at.substr(0, 10),
    };

    return latest;
}

export async function autoUpdater() {
    const latest = await checkLatestRelease();
    const current_version = `v${await window.electronAPI.getAppVersion()}`;

    if (latest.version !== current_version) {
        // add a button to the header
        const rightContainer = document.getElementsByClassName("right-container")[0];
        if (!rightContainer.querySelector(".new-update-header-link")){
            const newVersion = document.createElement("a");
            newVersion.textContent = "🔥 New update available!"
            newVersion.href = ""
            newVersion.classList.add("new-update-header-link");
            newVersion.addEventListener("click", function(event) {
                event.preventDefault();  // Prevent the link from navigating
                newVersionAlert(latest);
            });
            // firstChild is the current profile element
            rightContainer.insertBefore(newVersion, rightContainer.firstChild);
        }
    }
}