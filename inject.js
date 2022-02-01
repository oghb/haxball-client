const CURRENT_VERSION = "v0.3.3";
const RELEASES_URL =
  "https://api.github.com/repos/oghb/haxball-client/releases";
const EXTRA_GAMEMIN_URL =
  "https://rawcdn.githack.com/oghb/haxball-client/5f7553fc655c7b90504eead44d9f593f24e3e7bd/game-min_custom.js?min=1";

function injectGameMin(src) {
  const gameframe =
    document.documentElement.getElementsByClassName("gameframe")[0];
  let script = gameframe.contentWindow.document.createElement("script");
  script.src = src;
  script.type = "text/javascript";
  gameframe.contentWindow.document
    .getElementsByTagName("head")[0]
    .appendChild(script);
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
  const res = await fetch(RELEASES_URL, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  });

  const data = await res.json();

  const latest = {
    version: data[0].tag_name,
    url: data[0].assets.find((el) => el.name.indexOf(getOs()) !== -1)
      .browser_download_url,
    notes: data[0].body,
    date: data[0].published_at.substr(0, 10),
  };

  return latest;
}

async function autoUpdater() {
  const latest = await checkLatestRelease();

  if (latest.version !== CURRENT_VERSION) {
    const choice = confirm(
      "New version available!\n\nYou have → " +
        CURRENT_VERSION +
        "\n🔥Latest → " +
        latest.version +
        "\n\nClick OK to check it out!"
    );
    if (choice) showUpdaterView(latest);
  }
}

function showUpdaterView(latest) {
  const gameframe = document.getElementsByClassName("gameframe")[0];
  gameframe.contentWindow.document.body.innerHTML = "";

  let updaterDiv = document.createElement("div");
  updaterDiv.className = "autoupdater-view";
  updaterDiv.setAttribute("class", "autoupdater-view");

  updaterDiv.style = `position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;`;

  updaterDiv.innerHTML = `
      <head>
      <script type ="text/javascript">
            function downloadNewVersion(url) {
              window.location.replace(url);

              window.location.reload();
              alert("The new version is being downloaded to your Downloads folder");
            }
      </script>
      </head>
      <body>
      <div class="dialog">

      <h1>New client version</h1>
      <h1 style="font-size: 15px">Changelog ${latest.version} (${
    latest.date
  })</h1>

      ${latest.notes.replaceAll("\n", "<br><br>")}

      <br><br><br>

      <div align="center">
        <p style="font-size: 18px; font-weight: bold">Choose which version to download</p>
        <br>
        <p style="font-size: 12px">❗️Don't close the client until the download has finished❗️</p>
        <br>
        <div class="dl-buttons">
      		<button id="btn_std-dl" style="width: 200px" onclick="window.location.replace('${
            latest.url
          }'); alert('The client is now being downloaded in your Downloads folder')">⬇💾 Standard</button>
          <button id="btn_light-dl" style="width: 200px" onclick="window.location.replace('${
            latest.url
          }'); alert('The client is now being downloaded in your Downloads folder')">⬇💾 Lite</button>
        </div>
      </div>
      </body>
  </div>`;

  gameframe.contentWindow.document.body.appendChild(updaterDiv);
}

// removes ads
if (document.getElementsByClassName("rightbar").length != 0) {
  document.getElementsByClassName("rightbar")[0].innerHTML = "";
}

if (document.getElementsByClassName("overflowhidden").length != 0) {
  // custom header
  document.getElementsByClassName("header")[0].innerHTML = `
                        <span class="title"><a href="https://www.haxball.com/play">HaxBall Client by og</a></span>
                        <a href="https://www.haxball.com/play">New Tab (right click)</a>
                        <a href="https://discord.gg/RqGJ7ZyHqc">Discord</a>
                        <a href="https://github.com/oghb/haxball-client">GitHub</a>
                        `;
  // commandline
  let commandline = document.createElement("input");
  commandline.type = "text";
  commandline.size = 5;
  commandline.id = "commandline";
  commandline.style = "font-size: 20px";
  commandline.placeholder = "Paste a room link or enter a command";
  document.getElementsByClassName("header")[0].after(commandline);
}

if (localStorage.getItem("shortcuts") == null) {
  localStorage.setItem(
    "shortcuts",
    '[["/e","/extrapolation "],["/a", "/avatar "]]'
  );
}
if (localStorage.getItem("notes") == null) {
  localStorage.setItem("notes", "[]");
}

if (localStorage.getItem("fav_rooms") == null) {
  localStorage.setItem("fav_rooms", '["og-bot Big 3on3 ║ discord.gg/RRmBfP5"]');
}

if (localStorage.getItem("extraunlock") == null) {
  localStorage.setItem("extraunlock", "false");
}

// parses commands and room links typed in the command line
commandInput = document.getElementById("commandline");
commandInput.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    if (commandInput.value.match(/haxball.com/)) {
      const roomLink = commandInput.value.replace(/\s/g, "");
      if (roomLink.match(/^https:\/\/www\.haxball\.com\/play\?c=.{11}$/)) {
        commandInput.value = "";
        commandInput.placeholder = "Opening room link...";
        setTimeout(function () {
          window.location.replace(roomLink);
        }, 2000);
      } else {
        commandInput.value = "";
        commandInput.placeholder =
          "Wrong format! Example: https://www.haxball.com/play?c=3dcxYu4_nNw";
        setTimeout(function () {
          commandInput.placeholder = "Paste a room link or enter a command";
        }, 5000);
      }
      return;
    }

    const commandSplit = commandInput.value.split(" ");

    switch (true) {
      case commandSplit[0] == "shortcut":
        if (commandSplit[1] == "add") {
          const newShortcut = commandInput.value
            .replace("shortcut add ", "")
            .split(",");
          commandInput.value = "";
          if (newShortcut.length != 2) {
            commandInput.value = "";
            commandInput.placeholder =
              "Wrong syntax! Example: shortcut add !c,!claim yourpassword";
            setTimeout(function () {
              commandInput.placeholder = "Paste a room link or enter a command";
            }, 5000);
            return;
          }

          let shortcuts = JSON.parse(localStorage.getItem("shortcuts"));
          for (let i = 0; i < shortcuts.length; i++) {
            if (shortcuts[i][0] == newShortcut[0]) {
              commandInput.placeholder = `Shortcut already exists!`;
              setTimeout(function () {
                commandInput.placeholder =
                  "Paste a room link or enter a command";
              }, 4000);
              return;
            }
          }
          shortcuts.push(newShortcut);
          localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
          commandInput.placeholder = `New shortcut added: '${newShortcut[0]}' —> '${newShortcut[1]}'`;
          setTimeout(function () {
            commandInput.placeholder = "Paste a room link or enter a command";
          }, 3000);
        } else if (commandSplit[1] == "remove") {
          const inputShortcut = commandInput.value.replace(
            "shortcut remove ",
            ""
          );
          commandInput.value = "";
          const shortcuts = JSON.parse(localStorage.getItem("shortcuts"));
          let updatedShortcuts = [];

          for (let i = 0; i < shortcuts.length; i++) {
            if (shortcuts[i][0] != inputShortcut)
              updatedShortcuts.push(shortcuts[i]);
          }

          if (shortcuts.length == updatedShortcuts.length) {
            commandInput.placeholder = `Type 'shortcut list' to check the shortcuts you added`;
            setTimeout(function () {
              commandInput.placeholder = "Paste a room link or enter a command";
            }, 4000);
          } else {
            localStorage.setItem("shortcuts", JSON.stringify(updatedShortcuts));
            commandInput.placeholder = `Shortcut removed`;
            setTimeout(function () {
              commandInput.placeholder = "Paste a room link or enter a command";
            }, 3000);
          }
        } else if (commandSplit[1] == "list") {
          const shortcuts = JSON.parse(localStorage.getItem("shortcuts"));
          commandInput.value = "";
          if (shortcuts.length == 0) {
            commandInput.placeholder = `You haven't set any shortcuts`;
            setTimeout(function () {
              commandInput.placeholder = "Paste a room link or enter a command";
            }, 3000);
            return;
          }
          let shortcutsString = "Shortcuts list\n\n";
          for (let i = 0; i < shortcuts.length; i++)
            shortcutsString += `'${shortcuts[i][0]}' —> '${shortcuts[i][1]}'\n`;
          window.alert(shortcutsString);
          commandInput.placeholder = "Paste a room link or enter a command";
        }
        break;

      case commandSplit[0] == "notes":
        let notes = JSON.parse(localStorage.getItem("notes"));
        if (commandSplit[1] == "add") {
          const newNote = commandInput.value.replace("notes add ", "");

          notes.push(newNote);
          localStorage.setItem("notes", JSON.stringify(notes));

          commandInput.value = "";
          commandInput.placeholder = `New note added: '${newNote}'`;
        } else if (commandSplit[1] == "remove") {
          const index =
            parseInt(commandInput.value.replace("notes remove ", "")) - 1;
          commandInput.value = "";
          if (index >= notes.length) {
            commandInput.placeholder = `Invalid number. Check again by typing 'notes list'`;
            return;
          }

          commandInput.placeholder = `Removed note: '${notes[index]}'`;
          notes.splice(index, 1);
          localStorage.setItem("notes", JSON.stringify(notes));
          setTimeout(function () {
            commandInput.placeholder = "Paste a room link or enter a command";
          }, 2000);
        } else if (commandSplit[1] == "list") {
          commandInput.value = "";
          if (notes.length != 0) {
            let notesString = "Notes list\n\n";
            for (let i = 0; i < notes.length; i++) {
              notesString += `[${i + 1}] ${notes[i]}\n\n`;
            }
            window.alert(notesString);
          } else {
            commandInput.placeholder = "You haven't saved any notes";
          }
        }
        setTimeout(function () {
          commandInput.placeholder = "Paste a room link or enter a command";
        }, 3000);

        break;

      case commandSplit[0] == "auth":
        commandInput.value = "";
        if (commandSplit[1]) {
          if (commandSplit[1].match(/^idkey\..{43}\..{87}/)) {
            localStorage.setItem("player_auth_key", commandSplit[1]);
            commandInput.placeholder =
              "New player auth set! Reloading HaxBall...";
            setTimeout(function () {
              window.location.reload(true);
            }, 2000);
          } else {
            commandInput.placeholder = `Invalid private key, try copying and pasting again`;
            setTimeout(function () {
              commandInput.placeholder = "Paste a room link or enter a command";
            }, 3000);
          }
        } else {
          const player_auth_key = localStorage.getItem("player_auth_key");
          const alertString = `Public Auth\n${
            player_auth_key.split(".")[1]
          }\n\nPrivate Key (don't give this to anyone!)\n${player_auth_key}`;
          window.alert(alertString);
        }
        break;

      case commandSplit[0] == "avatar":
        commandInput.value = "";
        if (commandSplit[1]) {
          localStorage.setItem("avatar", commandSplit[1]);
          commandInput.placeholder = "New avatar set! Reloading HaxBall...";
          setTimeout(function () {
            window.location.reload(true);
          }, 2000);
        } else {
          const currentAvatar = localStorage.getItem("avatar");
          commandInput.placeholder =
            currentAvatar == null
              ? `No avatar set`
              : `Current avatar: ${currentAvatar.substring(0, 2)}`;
          setTimeout(function () {
            commandInput.placeholder = "Paste a room link or enter a command";
          }, 3000);
        }

        break;

      case commandSplit[0] == "clearavatar":
        commandInput.value = "";
        localStorage.removeItem("avatar");
        commandInput.placeholder = "Avatar cleared! Reloading HaxBall...";
        setTimeout(function () {
          window.location.reload(true);
        }, 2000);

      case commandSplit[0] == "extra":
        if (isNaN(commandSplit[1]) == false) {
          // let value = parseInt(commandInput.value.replace("extra ", ""));
          // commandInput.value = "";
          // if (value == localStorage.getItem("extrapolation")) {
          //   commandInput.placeholder = `Extrapolation was already set at ${value}ms`;
          //   setTimeout(function () {
          //     commandInput.placeholder = "Paste a room link or enter a command";
          //   }, 2000);
          //   return;
          // }
          // localStorage.setItem("extrapolation", value.toString());
          // commandInput.placeholder =
          //   "Extrapolation set! Reloading HaxBall with the new value...";
          // setTimeout(function () {
          //   window.location.reload(true);
          // }, 2000);
        } else if (commandInput.value == "extra") {
          const value = localStorage.getItem("extrapolation");
          commandInput.value = "";
          commandInput.placeholder =
            value == null
              ? `No extrapolation set`
              : `Current extrapolation: ${value}`;
          setTimeout(function () {
            commandInput.placeholder = "Paste a room link or enter a command";
          }, 3000);
        }
        break;

      case commandSplit[0] == "extraunlock":
        commandInput.value = "";

        if (localStorage.getItem("extraunlock") == "false") {
          injectGameMin(EXTRA_GAMEMIN_URL);
          localStorage.setItem("extraunlock", "true");
          commandInput.placeholder =
            "Extrapolation unlocked – you can now set any value up to 999ms";
        } else {
          commandInput.placeholder = "Extrapolation already unlocked!";
        }

        setTimeout(function () {
          commandInput.placeholder = "Paste a room link or enter a command";
        }, 3000);

        break;

      case commandSplit[0] == "favrooms":
        commandInput.value = "";
        let favRoomsString = "Favourite Rooms\n\n";
        const favRooms = JSON.parse(localStorage.getItem("fav_rooms"));
        if (favRooms.length != 0) {
          for (let i = 0; i < favRooms.length; i++)
            favRoomsString += favRooms[i] + "\n";
          window.alert(favRoomsString);
        } else {
          commandInput.placeholder =
            "You haven't added any room to your Favourites!";
          setTimeout(function () {
            commandInput.placeholder = "Paste a room link or enter a command";
          }, 2000);
        }
        break;

      case commandSplit[0] == "help":
        commandInput.value = "";
        window.alert(
          `Commands list

•Chat shortcuts A -> B
(A is what you type in chat
and B is what appears)
shortcut list
shortcut add A,B
shortcut remove A

•Notes
notes add yournote
notesremove notenumber
notes list

•Player Auth management (view/update)
auth
auth privatekey

•Extrapolation (view/unlock)
extra
extraunlock

•Avatar (view/update/clear)
avatar
avatar newavatar
clearavatar

•Favourite Rooms
favrooms

•HaxBall Client info
help
info
version`
        );
        break;

      case commandSplit[0] == "info":
        commandInput.value = "";
        window.alert(
          `HaxBall Client

This app was developed by og#9525 in an effort to create an overall better HaxBall experience.

It is open-source and built with open-source tools, namely nativefier and the 'HaxBall All-in-one' browser extension; some custom Javascript was also injected in the app to add even more functionalities.

Thank you for checking it out!

Links
https://discord.gg/RqGJ7ZyHqc
https://oghb.github.io/haxball-client/
https://github.com/nativefier/nativefier
https://github.com/xenonsb/Haxball-Room-Extension`
        );
        break;

      case commandSplit[0] == "version":
        commandInput.value = "";
        commandInput.placeholder = CURRENT_VERSION;
        setTimeout(function () {
          commandInput.placeholder = "Paste a room link or enter a command";
        }, 3000);
        break;
    }
  }
});

// borrowed from Haxball-Room-Extension 'content.js'
// wait until the game in iFrame loads, then continue
function waitForElement(selector) {
  return new Promise(function (resolve, reject) {
    var element = document
      .getElementsByClassName("gameframe")[0]
      .contentWindow.document.querySelector(selector);

    if (element) {
      resolve(element);
      return;
    }

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var nodes = Array.from(mutation.addedNodes);
        for (var node of nodes) {
          if (node.matches && node.matches(selector)) {
            resolve(node);
            return;
          }
        }
      });
    });

    observer.observe(
      document.getElementsByClassName("gameframe")[0].contentWindow.document,
      { childList: true, subtree: true }
    );
  });
}

// obeserver to detect changes to views
// and add custom buttons/shortcuts in chat
viewObserver = new MutationObserver(function (mutations) {
  candidates = mutations
    .flatMap((x) => Array.from(x.addedNodes))
    .filter((x) => x.className);
  if (candidates.length == 1) {
    const tempView = candidates[0].className;
    switch (true) {
      case tempView == "game-view":
        var gameframe =
          document.documentElement.getElementsByClassName("gameframe")[0];

        // waits for shortcuts in chat
        let chatInput = gameframe.contentWindow.document.querySelector(
          '[data-hook="input"]'
        );
        chatInput.addEventListener("keyup", function () {
          const shortcuts = JSON.parse(localStorage.getItem("shortcuts"));
          for (let i = 0; i < shortcuts.length; i++) {
            if (chatInput.value == shortcuts[i][0]) {
              chatInput.value = shortcuts[i][1];
              return;
            }
          }
        });

        // TranspUI button to change css
        const bottomSec =
          gameframe.contentWindow.document.getElementsByClassName(
            "bottom-section"
          )[0];
        const bottomRightButtons =
          bottomSec.getElementsByClassName("buttons")[0];

        let transpButton = document.createElement("button");
        transpButton.id = "invisui-btn";
        transpButton.innerHTML = "TranspUI";
        transpButton.addEventListener(
          "click",
          function () {
            if (localStorage.getItem("transp_ui") == "false") {
              localStorage.setItem("transp_ui", "true");
              let node = document.createElement("style");
              node.id = "invisui-style";
              node.appendChild(
                document.createTextNode(
                  '.game-view > .bottom-section {\nposition: absolute;\nleft: 0px;\nright: 0px;\nbottom: 0px;\nbackground: rgba(26, 33, 37, 0);\n}\n.game-view > .bottom-section > .stats-view {\nbackground: rgba(26, 33, 37, 0);\n}\n.game-view > .bottom-section > .chatbox-view > .input input[type="text"] {\nbackground: rgba(26, 33, 37, 0);\n}\n.game-view > .bottom-section button {\nbackground: rgba(26, 33, 37, 0);\n}\n.game-state-view .bar {\nbackground: rgba(26, 33, 37, 0);\n}'
                )
              );
              window.frames[0].document.head.appendChild(node);
            } else {
              localStorage.setItem("transp_ui", "false");
              window.frames[0].document.head.innerHTML =
                window.frames[0].document.head.innerHTML.replace(
                  '.game-view > .bottom-section {\nposition: absolute;\nleft: 0px;\nright: 0px;\nbottom: 0px;\nbackground: rgba(26, 33, 37, 0);\n}\n.game-view > .bottom-section > .stats-view {\nbackground: rgba(26, 33, 37, 0);\n}\n.game-view > .bottom-section > .chatbox-view > .input input[type="text"] {\nbackground: rgba(26, 33, 37, 0);\n}\n.game-view > .bottom-section button {\nbackground: rgba(26, 33, 37, 0);\n}\n.game-state-view .bar {\nbackground: rgba(26, 33, 37, 0);\n}',
                  ""
                );
            }
          },
          false
        );
        bottomRightButtons.appendChild(transpButton);

        break;

      case tempView == "roomlist-view":
        var gameframe =
          document.documentElement.getElementsByClassName("gameframe")[0];
        const splitter =
          gameframe.contentWindow.document.getElementsByClassName(
            "splitter"
          )[0];

        // listens for clicks on the roomlist
        // to switch between 'Add Room' / 'Del Room'
        splitter.addEventListener(
          "click",
          function () {
            const selectedRoom = this.getElementsByClassName("selected")[0];
            let favButton =
              this.getElementsByClassName("buttons")[0].children[4];
            if (
              typeof selectedRoom !== "undefined" &&
              typeof favButton !== "undefined"
            ) {
              const selectedRoomName =
                selectedRoom.querySelector('[data-hook="name"]').innerHTML;
              const favRooms = JSON.parse(localStorage.getItem("fav_rooms"));
              favRooms.includes(selectedRoomName) == true
                ? (favButton.innerHTML =
                    '<i class="icon-star"></i><div>Del Room</div>')
                : (favButton.innerHTML =
                    '<i class="icon-star"></i><div>Add Room</div>');
            }
          },
          false
        );

        const roomListButtons = splitter.getElementsByClassName("buttons")[0];

        //'Add/Del Room' button to add/delete a room to the Favourites
        let addFavButton = document.createElement("button");
        addFavButton.id = "addfav-btn";
        addFavButton.innerHTML = '<i class="icon-star"></i><div>Add Room</div>';

        addFavButton.addEventListener(
          "click",
          function () {
            var gameframe =
              document.documentElement.getElementsByClassName("gameframe")[0];
            const splitter =
              gameframe.contentWindow.document.getElementsByClassName(
                "splitter"
              )[0];
            const selectedRoom = splitter.getElementsByClassName("selected")[0];
            if (typeof selectedRoom !== "undefined") {
              const selectedRoomName =
                selectedRoom.querySelector('[data-hook="name"]').innerHTML;
              const favRooms = JSON.parse(localStorage.getItem("fav_rooms"));
              let updatedFavRooms = [];
              if (favRooms.includes(selectedRoomName) == false) {
                updatedFavRooms = favRooms;
                updatedFavRooms.push(selectedRoomName);
              } else {
                for (let i = 0; i < favRooms.length; i++) {
                  if (favRooms[i] != selectedRoomName)
                    updatedFavRooms.push(favRooms[i]);
                }
              }
              localStorage.setItem(
                "fav_rooms",
                JSON.stringify(updatedFavRooms)
              );
            }
          },
          false
        );
        roomListButtons.insertBefore(
          addFavButton,
          roomListButtons.childNodes[3]
        );

        // 'Show Rooms' button to show the Favourite Rooms
        let showFavButton = document.createElement("button");
        showFavButton.id = "showfav-btn";
        showFavButton.innerHTML =
          '<i class="icon-star"></i><div>Show Rooms</div>';

        showFavButton.addEventListener(
          "click",
          function () {
            var gameframe =
              document.documentElement.getElementsByClassName("gameframe")[0];
            const roomsList =
              gameframe.contentWindow.document.getElementsByClassName(
                "list"
              )[0];
            const roomsRows =
              roomsList.querySelector('[data-hook="list"]').rows;
            const favRooms = JSON.parse(localStorage.getItem("fav_rooms"));
            for (let i = 0; i < roomsRows.length; i++) {
              let roomName = roomsRows[i].querySelector(
                '[data-hook = "name"]'
              ).innerHTML;
              if (favRooms.includes(roomName) == false)
                roomsRows[i].style.display = "none";
            }
          },
          false
        );
        roomListButtons.insertBefore(
          showFavButton,
          roomListButtons.childNodes[4]
        );

        break;

      case tempView == "dropdown":
        autoUpdater();
        break;
    }
  }
});

// borrowed from Haxball-Room-Extension 'content.js'
// checks for changes in the page
init = waitForElement("div[class$='view']");
init.then(function (value) {
  if (localStorage.getItem("extraunlock") == "true") {
    injectGameMin(EXTRA_GAMEMIN_URL);
  }

  currentView = value.parentNode;
  viewObserver.observe(currentView, {
    characterData: false,
    childList: true,
    attributes: false,
    subtree: true,
  });
});
