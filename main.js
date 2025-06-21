const { app, shell, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');
const { z } = require('zod');

let win;

const validatePreferences = (prefs) => {
  const ProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    autosave: z.boolean(),
    avatar: z.string().nullable(),
    extrapolation: z.string().nullable(),
    fav_rooms: z.array(z.string()),
    geo_override: z.object({
      lat: z.number(),
      lon: z.number(),
      code: z.string()
    }).nullable(),
    player_auth_key: z.string().nullable(),
    player_name: z.string().nullable()
  });

  const PreferencesSchema = z.object({
      fps_unlock: z.boolean(),
      notes: z.array(z.object({
        title: z.string(),
        body: z.string(),
        time: z.string()
      })), 
      transp_ui: z.boolean(),
      shortcuts: z.array(z.tuple([z.string(), z.string()])),
      profiles: z.array(ProfileSchema)
  });

  try {
    PreferencesSchema.parse(prefs);
  } catch (err) {
    console.error('Failed to validate preferences:', err);
}

}

const saveAppPreferences = (prefs) => {
  const userDatapath = app.getPath('userData')
  const preferencesPath = path.join(userDatapath, 'preferences.json')
  try {
    fs.writeFileSync(preferencesPath, JSON.stringify(prefs, null, 2));
  } catch (error) {
    console.error('Error saving app preferences:', error);
  }
}

const loadAppPreferences = () => {
  const userDataPath = app.getPath('userData')
  const preferencesPath = path.join(userDataPath, 'preferences.json')
  const preferencesDefaultPath = path.join(__dirname, 'inject', 'preferences_default.json')
  try {
    if (fs.existsSync(preferencesPath)) {
      const fileContent = fs.readFileSync(preferencesPath, 'utf-8');
      const data = JSON.parse(fileContent)
      validatePreferences(data)
      return data;
    } else {
      // File doesn't exist, return and save default settings
      const fileContent = fs.readFileSync(preferencesDefaultPath, 'utf8')
      const data = JSON.parse(fileContent)
      validatePreferences(data)
      saveAppPreferences(data)
      return data;
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
    app.quit();
    return {};
  }
}

const preferences = loadAppPreferences();
if (preferences.fps_unlock) {
  app.commandLine.appendSwitch('disable-frame-rate-limit');
  console.log("FPS unlocked")
}

const createWindow = () => {
  const display = screen.getPrimaryDisplay();
  const { x, y, width, height } = display.bounds;

  const win = new BrowserWindow({
    x,
    y,
    width,
    height,
    minWidth: 1280,
    minHeight: 720,
    show: false, // start hidden
    fullscreen: false,
    fullscreenable: true,
    titleBarStyle: "default",
    kiosk: false,
    frame: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false
    },
    title: "HaxBall Client by og"
  });
  
  const extensionPath = path.join(path.dirname(__dirname), 'app.asar.unpacked', 'inject', 'Haxball-Room-Extension');
  win.webContents.session.loadExtension(extensionPath);

  win.loadURL('https://www.haxball.com/play');

  win.webContents.on('did-finish-load', () => {
    const injectJS = fs.readFileSync(path.join(__dirname, 'inject', 'inject.js'), 'utf8');
    // const injectCSS = fs.readFileSync(path.join(__dirname, 'inject', 'inject.css'), 'utf8');

    // win.webContents.executeJavaScript(`
    //   const style = document.createElement('style');
    //   style.textContent = \`${injectCSS}\`;
    //   document.head.appendChild(style);
    // `);

    win.webContents.executeJavaScript(injectJS);
  });

  // unlimited FPS workaround for newer electron versions
  // win.webContents.on('did-frame-finish-load', () => {
  //   if (!win.webContents.debugger.isAttached()) {
  //     try {
  //       win.webContents.debugger.attach('1.3');
  //     } catch (err) {
  //       console.error('Debugger attach failed:', err);
  //       return;
  //     }
  //   }

  //   if (preferences.fps_unlock){
  //     win.webContents.debugger.sendCommand('Emulation.setCPUThrottlingRate', {
  //       rate: 9
  //     }).then(() => {
  //       console.log('Throttling enabled');
  //     }).catch(err => {
  //       console.error('Failed to set throttling rate:', err);
  //     });
  //   }
  // })


  // Handle in-app navigation (e.g., <a href="..."> clicks)
  win.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    // const isInternal = parsedUrl.hostname.endsWith('haxball.com');

    const allowed = url.includes('haxball.com') || url.startsWith('https://github.com/oghb/haxball-client/releases/download');

    if (!allowed) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Handle window.open or target="_blank"
  win.webContents.setWindowOpenHandler(({ url }) => {
    const parsedUrl = new URL(url);
    const isInternal = parsedUrl.hostname.endsWith('haxball.com');

    if (isInternal) {
      createWindow(url);
    } else {
      shell.openExternal(url);
    }

    return { action: 'deny' }; // We handle both cases manually
  });

  return win;
}

ipcMain.handle('set-app-preference', async (event, key, value) => {
  // console.log('Received preference:', key, value);
  const prefs = loadAppPreferences();
  prefs[key] = value;
  saveAppPreferences(prefs);
});

ipcMain.handle('get-app-preferences', async () => {
  return loadAppPreferences();
});

ipcMain.on('restart-app', () => {
  console.log('Restarting app...');
  // app.relaunch();
  app.relaunch({
    execPath: process.execPath,
    args: process.argv.slice(1).concat(['--relaunch'])
  });
  app.exit(0);
});

ipcMain.on('ready-to-show', () => {
  win.show();
});

ipcMain.handle('save-preferences-file', async () => {
  const userDataPath = app.getPath('userData')
  const preferencesPath = path.join(userDataPath, 'preferences.json')
  const now = +new Date()

  const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: `preferences_${now}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
  });

  if (!canceled && filePath) {
      const content = await fs.promises.readFile(preferencesPath, 'utf-8');
      await fs.promises.writeFile(filePath, content);
      return { success: true };
  }
  return { succes: false };
});


ipcMain.handle('import-preferences-file', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select Preferences JSON',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile']
  });

  if (canceled || filePaths.length === 0) {
      return { success: false, error: 'No file selected.' };
  }

  try {
      const filePath = filePaths[0];
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      // console.log(data)

      // Validate the data
      validatePreferences(data);

      // Save it to the Electron user data folder
      const userDataPath = app.getPath('userData');
      const preferencesPath = path.join(userDataPath, 'preferences.json');

      fs.writeFileSync(preferencesPath, JSON.stringify(data, null, 2), 'utf-8');

      return { success: true };
  } catch (err) {
      console.error('Failed to import preferences:', err);
      return { success: false, error: err.errors || err.message || 'Invalid JSON file.' };
  }
});

ipcMain.handle('delete-preferences-file', async (event) => {
  const userDataPath = app.getPath('userData')
  const preferencesPath = path.join(userDataPath, 'preferences.json')
  try {
    if (fs.existsSync(preferencesPath)) {
      fs.rmSync(preferencesPath);
      return { success: true }
    }
  } catch (error) {
    console.error('Error deleting preferences:', error);
    return { success: false };
  }
})

app.whenReady().then(() => {
  win = createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});