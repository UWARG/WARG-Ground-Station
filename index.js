/**
 * @author Serge Babayan
 * @requires electron
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description This is the main file that starts up the electron app
 */

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
var MenuBuilder = require('./app/core/MenuBuilder');
var DataRelay = require('./app/connections/DataRelay.js');
var AircraftStatus = require('./app/AircraftStatus'); //required for initialization of the aircraft status manager

//need to keep a global reference of the main window otherwise it'll be closed when javascript garbage collects
let mainWindow;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// when electron has initialized and ready to open windows
app.on('ready', function() {
  DataRelay.init(); //start the data relay connection

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1600, height: 900});

  mainWindow.setMenu(MenuBuilder.build());

  // and load the mainWindow.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/templates/windows/mainWindow.html');

  // Emitted when the window is closing.
  mainWindow.on('close', function () {
    app.exit(0);     
  });
});