var electron = require('electron');
var path = require('path')
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
    frame: false,
    icon: path.join(__dirname, 'assets/icons/64x64.png')
  });
  require('vue-devtools').install()
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.toggleDevTools();
});
