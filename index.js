var electron = require('electron');
var path = require('path')
const remote = require('electron').remote;
var {
  app,
  BrowserWindow,
  ipcMain,
  dialog
} = electron;
var mainWindow = null;


app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      experimentalFeatures: true
    },
    transparent: true,
    frame: false,
    icon: path.join(__dirname, 'assets/icons/64x64.png'),
    'minHeight': 520,
    'minWidth': 400
  });
  require('vue-devtools').install()
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  //mainWindow.toggleDevTools();
});
