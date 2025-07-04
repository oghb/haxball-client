# HaxBall Client by og

Unofficial client for the browser game [HaxBall](https://www.haxball.com/play), built with [Electron](https://github.com/electron/electron) and shipping with the browser extension [HaxBall All-in-one Tool](https://github.com/xenonsb/Haxball-Room-Extension).

The client works on **Windows** (64bit/32bit/ARM), **macOS** (Apple Silicon/Intel), and **Linux** (64bit).

We are also on **[Discord](https://discord.gg/zDzYamtcfX)**!

✨ **Features at a glance:**

* Comes with the [All-in-one Tool](https://github.com/xenonsb/Haxball-Room-Extension/)
* No ads
* Unlockable FPS
* User profiles
* Favorite rooms
* Chat shortcuts
* Automatic updates
* Glass UI (if enabled)
* Easy Auth management

## How to install and run

Download from the [main website](https://oghb.github.io/haxball-client/) or from the [Releases](https://github.com/oghb/haxball-client/releases) page the latest version for your OS.

Then

* if you're on **Windows**, extract the executable from the downloaded archive and run it. No installation needed. If you get a warning from your antivirus, it's a false positive.

* if you're on **macOS**, open the DMG and move the app in your `Applications` folder, then run it. If it says that the app is damaged or can't be opened, [follow Method 4 from this guide](https://osxdaily.com/2019/02/13/fix-app-damaged-cant-be-opened-trash-error-mac/).
  
* if you're on **Linux**, either install from the `.deb` or `.AppImage`, the run it as per your distro.

## Known bugs

* the app doesn't restart automatically on Windows
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

### ⚡️ Unlimited FPS

The app allows unlocking the game's framerate. Just click on **Settings**, on the header, and then set the corresponding option to **Unlimited**. You will need to restart the app afterwards!

⚠ Note that this feature may not work flawlessly for everyone. It is still under testing.

### 💬 Shortcuts

Shortcuts let you type frequent commands or messages by automatically expanding a specific text written in chat.

The app comes with two pre-configured shortcuts:

* `/e`, which expands to `/extrapolation `
* `/a`, which expands to `/avatar `

as well as shortcuts for all emojis (such as `:smile:` to get 😀).

You can set as many shortcuts as you like!

### 🔐 Player Auth management

Your Player Auth is typically used by headless rooms' admins to authenticate you or to save your in-game statistics. You can easily view, change, or reset your auth by clicking on **Settings** on the header.

If you want to import your room logins from your browser, just visit [this page](https://haxball.com/playerauth) and copy the **Private Key**.

If instead you are using an old version of the client, type `auth` in the command bar and copy the **Private Key**.

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