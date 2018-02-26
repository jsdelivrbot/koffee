var Client = require('instagram-private-api').V1;
var {prompt} = require("inquirer")
var chalk = require('chalk');
var Promise = require('bluebird');

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
