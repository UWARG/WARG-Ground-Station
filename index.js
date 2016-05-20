/**
 * @author Serge Babayan
 * @requires electron
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence ISC
 * @description This is the main file that starts up the electron app
 */

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

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
app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1600, height: 900});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});