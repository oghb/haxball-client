# HaxBall Client

Unofficial client for the HTML5 browser game [HaxBall](https://www.haxball.com/play), built with a custom build of [nativefier](https://github.com/nativefier/nativefier) in order for the browser extension [HaxBall All-in-one Tool](https://github.com/xenonsb/Haxball-Room-Extension) to be supported.

The client works on Windows, macOS and Linux, and is 64-bit only.

## Standard & Lite version
The client comes in two versions which only differ for one thing:
* **Standard**: the game plays at un unlimited framerate (as many FPS as your computer can handle)
* **Lite**: the framerate will be limited to your monitor's refresh rate (e.g. 60fps with a 60Hz monitor, 144fps with a 144Hz monitor, etc)

Only a good PC can handle unlimited FPS, so download the **Lite** version if the **Standard** gives you any ping/performance issue!

## How to run
Download from the [main website](https://oghb.github.io/haxball-client/) or from the [Releases](https://github.com/oghb/haxball-client/releases) page the **.zip** file with the version for your OS and unzip it.

Then
* if you're on **Windows**, move the folder wherever you want and double-click on `HaxBall Client`
* if you're on **macOS**, move the `HaxBall Client.app` in your `Applications` folder and then double-click on it
  if you get a "The app is damaged and can't be opened", [follow Method 1 from this guide](https://www.funkyspacemonkey.com/how-to-open-applications-from-anywhere-in-macos-monterey)
* if you're on **Linux**, move the folder wherever you want, `cd` into that folder and then type `./HaxBallClient` in the terminal (you may need to install some libraries first)

## Features
* Every feature of the All-in-one Tool, including
  * Auto-join
  * Room search
  * Kick/Ban quick buttons
  * Local mute
  * Hide chat toggle
  * **R** as a REC hotkey
  * Chat shortcuts\*
* Favourite Rooms
* Dedicated button to make the UI transparent
* Unlockable extrapolation
* Unlimited FPS\*\*
* Automatic updates
* Custom command-line (see below)
* No ads

\* *these were originally featured in the All-in-one Tool, but given that they do not work in the client they have been rewritten from scratch (see below)*

\*\* *only in the **Standard** version of the client*

### Favourite Rooms
Two new buttons have been added to the **Room list** view: **Add Room** and **Show Rooms**.

By selecting a room in the list and then clicking the **Add Room** button, such room will be added to the list of your **Favourite Rooms**, and will be easily accessible by clicking the **Show Rooms** button.

In addition to the **Search** feature provided by the All-in-one Tool, this functionality comes very handy when you only are interested in a few rooms, and some of these are distant from your geographical position or not close to each other.

A room will stay among your **Favourites** (use the `favrooms` command in the command-line to see them all) regardless of it being online or not, as long as its name doesn't change.

### Command-line
The horizontal bar on the top has two functions: **redirect you to a room** given its link and launch **custom commands**.

#### Available commands
##### Shortcuts
Shortcuts let you type frequent commands/messages by expanding a shorter piece of text.
* `shortcut add A,B`
* `shortcut remove A`
* `shortcut list`

For example, you may be someone who often changes extrapolation and you'd prefer not to type the full command each time. To do so, you can create a new shortcut by entering in the command bar

`shortcut add /e,/extrapolation`

so that every time you type in the game chat `/e` you will instead get `/extrapolation`.
If you wish to remove it, you can then use

`shortcut remove /e`

This particular shortcut is included by the default in the client, but you can create whatever shortcut you want (even entire messages)!

##### Notes
Notes let you store text snippets you may want to save up for later.
* `notes add yournote`
* `notes remove notenumber`
* `notes list`

 For instance, you could save links to private rooms, different private keys for different rooms, a Discord invite someone linked in chat, or some longer chat commands you don't want to create a shortcut for (like team colors).

To remove a saved note, check its number with `list` and then use `remove`.

##### Player Auth management
Your Player Auth is often used by headless rooms' admins to authenticate you or to save your in-game statistics. If you want to view your Public Auth or Private Key, or change the latter, type the commands
* `auth`
* `auth yournewprivatekey`

##### Extrapolation
If you want to view your extrapolation without entering a room or opening the console, type in the command bar
* `extra`

Although I don't support the choice, since it was highly requested a command to uncap the extrapolation is also available
* `extraunlock`

You only need to launch this command once.

##### Avatar
If you want to view or change your avatar without entering a room or opening the console, type in the command bar
* `avatar`
* `avatar newavatar`
* `clearavatar`

##### Favourite Rooms
Use the `favrooms` command to have a list of every room currently marked as **Favourite**.

##### Client info
* `help`
* `info`
* `version`

## How to build
In order to build the client you will need to have [git](https://git-scm.com/downloads) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/) installed; there are plenty of tutorials on how to install them on your platform so it won't be explained here.

Open a terminal and clone both this repository and nativefier in the same parent directory (e.g on your Desktop)
```bash
git clone https://github.com/oghb/haxball-client.git
git clone https://github.com/nativefier/nativefier.git
```

Open the `nativefier` repository you just cloned and go to `app/src`, where you'll find a file called `main.ts`: replace it with the `main.ts` in this repository.

**Note**: if you *don't* want unlimited FPS (it may increase ping or worsen performance on older PC's), put two slashes `//` in front of the appropriate line in `main.ts`.

You can now build the modified nativefier with
```bash
npm install
```
(make sure the working directory of the terminal is `nativefier`) and when it's done building, launch
```bash
npm link
```
so when you launch `nativefier` your system will actually use this one.

Now launch `cd ..` to go in the parent directory of `nativefier` (the one where you cloned the two repositories to), and launch these commands to build the client and copy the HaxBall All-in-one tool within:
- Windows client
```bash
nativefier https://www.haxball.com/play --internal-urls ".*?\.haxball\.*?" --name "HaxBall Client" --inject haxball-client/inject.js --inject haxball-client/inject.css --icon haxball-client/icon.png --tray start-in-tray --fast-quit --arch x64 --platform windows --app-version 0.3.4 --build-version 0.3.4 --win32metadata '{"ProductName": "HaxBall Client", "InternalName": "HaxBall Client", "FileDescription": "Unofficial client for haxball.com"}'
git clone https://github.com/xenonsb/Haxball-Room-Extension.git ./HaxBall\ Client-win32-x64/resources/app/Haxball-Room-Extension
```
- macOS (M1) client
```bash
nativefier https://www.haxball.com/play --browserwindow-options '{"fullscreenable": true}' --internal-urls ".*?\.haxball\.*?" --name "HaxBall Client" --inject haxball-client/inject.js --inject haxball-client/inject.css --icon haxball-client/icon.png --tray start-in-tray --fast-quit --arch arm64 --platform osx --app-version 0.3.4 --build-version 0.3.4
git clone https://github.com/xenonsb/Haxball-Room-Extension.git ./HaxBall\ Client-darwin-arm64/HaxBall\ Client.app/Contents/Resources/app/Haxball-Room-Extension
```

- macOS (Intel) client
```bash
nativefier https://www.haxball.com/play --browserwindow-options '{"fullscreenable": true}' --internal-urls ".*?\.haxball\.*?" --name "HaxBall Client" --inject haxball-client/inject.js --inject haxball-client/inject.css --icon haxball-client/icon.png --tray start-in-tray --fast-quit --arch x64 --platform osx --app-version 0.3.4 --build-version 0.3.4
git clone https://github.com/xenonsb/Haxball-Room-Extension.git ./HaxBall\ Client-darwin-x64/HaxBall\ Client.app/Contents/Resources/app/Haxball-Room-Extension
```

- Linux client
```bash
nativefier https://www.haxball.com/play --internal-urls ".*?\.haxball\.*?" --name "HaxBall Client" --inject haxball-client/inject.js --inject haxball-client/inject.css --icon haxball-client/icon.png --tray start-in-tray --fast-quit --arch x64 --platform linux --app-version 0.3.4 --build-version 0.3.4
git clone https://github.com/xenonsb/Haxball-Room-Extension.git ./HaxBallClient-linux-x64/resources/app/Haxball-Room-Extension
```
