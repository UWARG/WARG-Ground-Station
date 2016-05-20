/**
 * @author Serge Babayan
 * @module core/WindowManager
 * @requires electron
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence ISC
 * @description Manages the creation and destruction of windows for the application
 */
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

var WindowsManager = {
  /**
   * @var open_windows {ObjectHash} Stores all the currently open windows
   * @private
   */
  open_windows: {},

  /**
   * @function openWindow
   * @description Opens a window by either creating it or focusing on an existing one
   * @param window_file_name {string} The window template file name
   * @param options {Object} Parameters specific to electron.BrowserWindow
   */
  openWindow: function (window_file_name, options) {
    //if the window is already open, focus on it
    if (this.open_windows[window_file_name]) {
      this.open_windows[window_file_name].focus();
    }
    //otherwise create the window
    else {
      let new_window = new BrowserWindow(options);
      new_window.name = window_file_name;
      new_window.loadURL('file://' + __dirname + 'windows/' + window_file_name);

      if (options.openDevTools) {
        new_window.webContents.openDevTools();
      }
      //delete all instances of the window
      new_window.on('closed', function () {
        this.open_windows[new_window.name] = null;
        delete this.open_windows[new_window.name];
      }.bind(this));

      this.open_windows[new_window.name] = new_window;
    }
  }
};

module.exports = WindowsManager;