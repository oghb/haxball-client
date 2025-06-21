export const injectFavoriteRoomsButtons = (): void => {
    const gameframe = document.getElementsByClassName("gameframe")[0] as HTMLIFrameElement;
    const splitter = gameframe.contentDocument?.getElementsByClassName("splitter")[0] as HTMLElement;
    if (!splitter) return;

    const roomListButtons = splitter.getElementsByClassName("buttons")[0];

    // Create 'Add/Del Room' button
    const addFavButton = gameframe.contentDocument?.createElement("button");
    addFavButton.id = "addfav-btn";
    addFavButton.innerHTML = '<i class="icon-star"></i><div>Add Room</div>';
    roomListButtons.insertBefore(addFavButton, roomListButtons.childNodes[3]);

    // Create 'Show Rooms' button
    const showFavButton = gameframe.contentDocument?.createElement("button");
    showFavButton.id = "showfav-btn";
    showFavButton.innerHTML = '<i class="icon-star"></i><div>Show Rooms</div>';
    roomListButtons.insertBefore(showFavButton, roomListButtons.childNodes[4]);

    let isFiltering = false; // Track filter state

    // Add/Del Room logic
    addFavButton.addEventListener("click", () => {
        const selectedRoom = splitter.getElementsByClassName("selected")[0];
        if (!selectedRoom) return;

        const roomName = selectedRoom.querySelector('[data-hook="name"]')?.innerHTML;
        if (!roomName) return;

        let favRooms: string[] = JSON.parse(localStorage.getItem("fav_rooms") || "[]");
        if (favRooms.includes(roomName)) {
            favRooms = favRooms.filter(r => r !== roomName);
        } else {
            favRooms.push(roomName);
        }
        if (favRooms.length !== 0){
            localStorage.setItem("fav_rooms", JSON.stringify(favRooms));
        } else {
            localStorage.setItem("fav_rooms", "[]")
        }

        updateFavButtonLabel(addFavButton, splitter); // Refresh label after change
    });

    // Show/Hide Favorites logic
    showFavButton.addEventListener("click", () => {
        const roomsList = gameframe.contentDocument?.getElementsByClassName("list")[0];
        const roomsRows = roomsList?.querySelector('[data-hook="list"]')?.querySelectorAll("tr");
        const favRooms: string[] = JSON.parse(localStorage.getItem("fav_rooms") || "[]");

        if (!roomsRows) return;

        if (!isFiltering) {
            roomsRows.forEach(row => {
                const roomName = row.querySelector('[data-hook="name"]')?.innerHTML;
                if (roomName && !favRooms.includes(roomName)) {
                    (row as HTMLElement).style.display = "none";
                }
            });
            isFiltering = true;
            showFavButton.innerHTML = '<i class="icon-star"></i><div>Show All</div>';
        } else {
            roomsRows.forEach(row => {
                (row as HTMLElement).style.display = "";
            });
            isFiltering = false;
            showFavButton.innerHTML = '<i class="icon-star"></i><div>Show Rooms</div>';
        }
    });

    splitter.addEventListener("click", function () {
        const favButton = splitter.querySelector("#addfav-btn") as HTMLButtonElement;
        if (favButton) {
            updateFavButtonLabel(favButton, splitter);
        }
    });

    // Listen for the refresh button to reset the state
    const refreshButton = gameframe.contentDocument?.querySelector('[data-hook="refresh"]') as HTMLButtonElement;
    if (refreshButton) {
        refreshButton.addEventListener("click", () => {
            // Reset the filter state because the list was refreshed
            isFiltering = false;
            showFavButton.innerHTML = '<i class="icon-star"></i><div>Show Rooms</div>';
        });
    }
}

// Utility to set Add/Del label correctly
function updateFavButtonLabel(button: HTMLButtonElement, splitter: HTMLElement) {
    const selectedRoom = splitter.getElementsByClassName("selected")[0];
    if (!selectedRoom) return;

    const roomName = selectedRoom.querySelector('[data-hook="name"]')?.innerHTML;
    if (!roomName) return;

    const favRooms: string[] = JSON.parse(localStorage.getItem("fav_rooms") || "[]");

    button.innerHTML = favRooms.includes(roomName)
        ? '<i class="icon-star"></i><div>Del Room</div>'
        : '<i class="icon-star"></i><div>Add Room</div>';
}