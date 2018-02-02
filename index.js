var Client = require('instagram-private-api').V1;
var {
  prompt} = require("inquirer")
var chalk = require('chalk');
var Promise = require('bluebird');

var electron = require('electron');
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
    frame: false
  });

  let auguryPath = '//home/koso00/.config/google-chrome/Default/Extensions/diebikgmpmeppiilkaijjbdgciafajmg/1.0.8_0';
  BrowserWindow.addDevToolsExtension(auguryPath);
  mainWindow.loadURL(`file://${__dirname}/index.html`);

});
