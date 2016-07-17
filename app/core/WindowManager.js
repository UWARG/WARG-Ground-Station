/**
 * @author Serge Babayan
 * @module core/WindowManager
 * @requires electron
 * @requires util/Logger
 * @requires root-path
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Manages the creation and destruction of windows for the application
 */
var Logger = require('../util/Logger');
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
var app_root = require('root-path');

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
    options = options || {};
    //if the window is already open, focus on it
    if (this.open_windows[window_file_name]) {
      this.open_windows[window_file_name].focus();
    }
    //otherwise create the window
    else {
      var new_window = new BrowserWindow(options);
      new_window.name = window_file_name;
      new_window.loadURL('file://' + app_root(`templates/windows/${window_file_name}.html`));
      new_window.setMenu(null); //we don't want new windows to have their own menu

      if (options.devTools) {
        new_window.webContents.openDevTools();
      }

      new_window.on('close', function () {
        Logger.debug(`Closing ${new_window.name} window`);
        //workaround since the windows don't close correction on win OS
        this.open_windows[new_window.name].hide();
        this.open_windows[new_window.name] = null;
        delete this.open_windows[new_window.name];
      }.bind(this));

      this.open_windows[new_window.name] = new_window;
      Logger.debug(`Opening ${new_window.name} window`);
    }
  },
  /**
   * @function getWindowNameFromId
   * @description Retrieves the hash key or window name for a window based on its BrowserWindow id
   * @param id {int} The id of the window
   * @returns name {string|null} The name of the window, or null if one wasn't found
   */
  getWindowNameFromId: function (id) {
    for (var window in this.open_windows) {
      if (this.open_windows.hasOwnProperty(window)) {
        if (this.open_windows[window].id === id) {
          return window;
        }
      }
    }
    return null;
  },

  /**
   * @function getFocusedWindowName
   * @description Returns the unique name for the currently focused window
   * @returns name {string|null} The name of the window, or null if one wasn't found
   */
  getFocusedWindowName: function () {
    return this.getWindowNameFromId(electron.BrowserWindow.getFocusedWindow().id);
  }
};

module.exports = WindowsManager;