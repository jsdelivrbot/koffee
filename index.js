var electron = require('electron');
const remote = require('electron').remote;
var {
  app,
  BrowserWindow,
  ipcMain
} = electron;
var mainWindow = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      experimentalFeatures: true
    },
    transparent: true,
    frame: false
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.toggleDevTools();
});
