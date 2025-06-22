# HaxBall Client by og

Unofficial client for the browser game [HaxBall](https://www.haxball.com/play), built with [Electron](https://github.com/electron/electron) and shipping with the browser extension [HaxBall All-in-one Tool](https://github.com/xenonsb/Haxball-Room-Extension).

The client works on **Windows** (64bit/32bit/ARM), **macOS** (Apple Silicon/Intel), and **Linux** (64bit).

We are also on **[Discord](https://discord.gg/zDzYamtcfX)**!

✨ **Features at a glance:**

* Every feature of the [All-in-one Tool](https://github.com/xenonsb/Haxball-Room-Extension/)
* No ads
* Unlockable FPS
* User profiles
* Favorite rooms
* Chat shortcuts
* Automatic updates
* Notes
* Custom Clear UI (if enabled)
* Easy Auth management
* Custom command line and room URL bar

## How to install and run

Download from the [main website](https://oghb.github.io/haxball-client/) or from the [Releases](https://github.com/oghb/haxball-client/releases) page the latest version for your OS.

Then

* if you're on **Windows**, extract the executable from the downloaded archive and run it. No installation needed.

* if you're on **macOS**, open the DMG and move the app in your `Applications` folder, then run it. If it says that the app is damaged or can't be opened, [follow Method 4 from this guide](https://osxdaily.com/2019/02/13/fix-app-damaged-cant-be-opened-trash-error-mac/).
  
* if you're on **Linux**, either install from the `.deb` or `.AppImage`, the run it as per your distro.

## When you first launch

Some suggestions:

- if you want to play with unlimited FPS, type `fps unlock` in the command bar on top and press Enter. This is only needed once.
- by default, the All-in-one tool automatically hides the NavBar (the bar on top of the client) when you join a room. To avoid this, click the "**⚙️ Add-on**" button in the bottom-right corner of the room list, and deselect "Hide NavBar by default".

## Known bugs

* the app doesn't restart automatically on Windows
* if you are in a room, you must first leave it before you can close the app
* if a room set to favorite changes name or no longer exists, there is no way to remove it and hide it from the Profile page 

If a bug you found isn't here, [open an issue](https://github.com/oghb/haxball-client/issues)!

## Features in detail

### 👤 User Profiles

User profiles let you set up different player identities that you can switch between easily. This is useful if you play on different maps, in rooms that all require a separate registration, or just to keep things organized. It saves you from the hassle of using multiple browsers, incognito tabs, or constantly clearing browser data just to manage separate HaxBall “accounts”.

Each profile has its own

* nickname
* avatar
* auth (your "identity")
* extrapolation
* location override
* list of favorite rooms.
  
You can manage profiles by clicking in the **top-right corner**, where there's a user icon with "**Default**" next to it. The **Default** profile can't be deleted and is automatically updated if you change your nickname, extrapolation, or any of the other attributes listed above. It's like your standard browser experience. When you click on it, you'll be able to create new profiles (there is no limit), switch to a different one, or delete those you no longer need. 

### 📟 Command bar

The horizontal bar on the top allows you to use certain features of the app that are uncommon or *set-and-forget*. To get started, just click on the bar. A dropdown menu will appear and show all available commands and how to use them. You can use the arrow keys to move through options and press TAB for autocompletion. Then just press Enter to execute.

#### ⚡️ FPS unlock

The app allows unlocking the game's framerate. Just type `fps unlock` and restart the app. To revert the change, type `fps lock`.

⚠ Note that this feature may not work flawlessly for everyone. It is still under testing.

#### 💬 Shortcuts

Shortcuts let you type frequent commands or messages by automatically expanding a shorter piece of text written in chat.

* `shortcut add A,B`
* `shortcut remove A`
* `shortcut list`

The app comes with two pre-configured shortcuts:

* `/e`, which expands to `/extrapolation `
* `/a`, which expands to `/avatar `

#### 📝 Notes

Notes let you store text snippets you may want to save up for later.

* `note add notetitle,yournote`
* `note remove notenumber`
* `note list`

 For instance, you could save links to private rooms, a Discord invite someone linked in chat, or some longer chat commands you don't want to create a shortcut for, like team colors.

To remove a saved note, check its number with `list` and then use `remove`.

#### 🔐 Player Auth management

Your Player Auth is typically used by headless rooms' admins to authenticate you or to save your in-game statistics. Use

* `auth show`, to view your auth
* `auth new`, to generate a new auth
* `auth set privatekey`, to change to a different auth using the corresponding private key


## How to build

Clone this repository. Next, run

```sh
npm install
```

to install all dependencies. Finally, run the build command for your OS, as specified in `package.json`.

For instance, for the Windows 64bit version, run

```sh
npm run build:win-x64
```