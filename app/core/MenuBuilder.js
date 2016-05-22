/**
 * @author Serge Babayan
 * @module core/MenuBuilder
 * @requires core/Menu
 * @requires core/WindowManager
 * @requires electron
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Builds an electron based menu template from the core/Menu file
 * and returns an electron menu that can be attached to a BrowserWindow
 */
const electron = require('electron');
const ElectronMenu = electron.Menu;
var Menu = require('./Menu');
var WindowManager = require('./WindowManager');

/**
 * function build
 * @returns {electron.Menu} menu
 */
module.exports.build = function () {
  var menu_template = [];

  for (var menu_label in Menu) {
    var submenu = [];
    if (Menu.hasOwnProperty(menu_label)) {
      for (var sub_menu_label in Menu[menu_label]) {
        if (Menu[menu_label].hasOwnProperty(sub_menu_label)) {
          if (Menu[menu_label][sub_menu_label].type === 'separator') {
            submenu.push({
              type: 'separator'
            });
            continue;
          }
          submenu.push({
            label: sub_menu_label,
            accelerator: Menu[menu_label][sub_menu_label].shortcut || null,
            click: function (menu_label, sub_menu_label) {
              if (Menu[menu_label][sub_menu_label].callback) {
                Menu[menu_label][sub_menu_label].callback();
              }
              if (Menu[menu_label][sub_menu_label].openWindow) {
                WindowManager.openWindow(Menu[menu_label][sub_menu_label].openWindow, {
                  devTools: Menu[menu_label][sub_menu_label].devTools,
                  height: Menu[menu_label][sub_menu_label].height || 500,
                  width: Menu[menu_label][sub_menu_label].width || 500
                });
              }
            }.bind(this, menu_label, sub_menu_label)
          })
        }
      }
      menu_template.push({
        label: menu_label,
        submenu: submenu
      });
    }
  }

  menu_template.push(
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function (item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (function () {
            if (process.platform == 'darwin')
              return 'Ctrl+Command+F';
            else
              return 'F11';
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: (function () {
            if (process.platform == 'darwin')
              return 'Alt+Command+I';
            else
              return 'Ctrl+Shift+J';
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.webContents.toggleDevTools();
          }
        }
      ]
    });

  menu_template.push({
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Electron Docs',
        click: function () {
          require('electron').shell.openExternal('http://electron.atom.io')
        }
      }
    ]
  });

  return ElectronMenu.buildFromTemplate(menu_template);
};