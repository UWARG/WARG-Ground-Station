/**
 * @author Serge Babayan
 * @module core/WindowShortcuts
 * @requires util/Logger
 * @requires electron
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence ISC
 * @description Creates common shortcuts for a window. Requires `Mousetrap.js` to be declared within the window.
 * Current shortcuts include the ability to close and refresh windows, as well as open dev tools.
 * @example <caption>Usage example</caption>
 * var WindowShortcuts = require('../../app/core/WindowShortcuts');
 * WindowShortcuts.init(Mousetrap); //we pass in mousetrap in here
 */
var electron = require('electron');
var remote = electron.remote;
var Logger = remote.require('./app/util/Logger');
var WindowManager = remote.require('./app/core/WindowManager');

/**
 * function init
 * @param Mousetrap {Object} Reference to the window's Mousetrap object
 */
module.exports.init = function (Mousetrap) {
  //opens up devtools for the specified window
  Mousetrap.bind('mod+shift+j', function (e) {
    remote.getCurrentWebContents().toggleDevTools();
  });

  //refreshes the window
  Mousetrap.bind('mod+shift+r', function (e) {
    Logger.debug('Refreshing ' + WindowManager.getFocusedWindowName() + ' window');
    remote.getCurrentWindow().reload();
  });

  //closes the window
  Mousetrap.bind('mod+shift+q', function (e) {
    Logger.debug('Closing ' + WindowManager.getFocusedWindowName() + ' window');
    remote.getCurrentWindow().close();
  });
};
