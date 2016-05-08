const remote = require('electron').remote;
const Menu = remote.Menu;
const BrowserWindow = remote.BrowserWindow;


var path=require("path");

module.exports.initialize=function(){
  var menu_template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Import PID Gains',
        },
        {
          label: 'Import Path',
        },
        {
          label: 'Import Settings',
        },
        {
          type: 'separator'
        },
        {
          label: 'Export PID Gains',
        },
        {
          label: 'Export Path',
        },
        {
          label: 'Save Settings as...',
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: function() {
            remote.app.quit();
          },
          role: 'close'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (function() {
            if (process.platform == 'darwin')
              return 'Ctrl+Command+F';
            else
              return 'F11';
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: (function() {
            if (process.platform == 'darwin')
              return 'Alt+Command+I';
            else
              return 'Ctrl+Shift+I';
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Windows',
      role: 'window',
      submenu: [
        {
          label: 'Simulation Mode',
          click: function(){
            var win = new BrowserWindow({ width: 800, height: 600 });
            win.loadURL(path.join(__dirname,'../../windows/simulationMode.html'));
          }

        },
        {
          label: 'Console',
          accelerator: 'CmdOrCtrl+C',
        },
        {
          label: '3D View'
        },
        {
          label: 'Autonomus Level Adjust',
          accelerator: 'CmdOrCtrl+A'
        },
        {
          label: 'Data Entry',
          accelerator: 'CmdOrCtrl+D',
        },
        {
          label: 'Data View',
          accelerator: 'CmdOrCtrl+V',
        },
        {
          label: 'Gains Adjust',
          accelerator: 'CmdOrCtrl+G',
        },
        {
          label: 'Probe Drops',
          accelerator: 'CmdOrCtrl+P',
        }
      ]
    },
    {
      label: 'Settings',
      role: 'help',
      submenu: [
        {
          label: 'Network Settings',
          accelerator: 'CmdOrCtrl+S',
        },
        {
          label: 'App Settings',
          accelerator: 'CmdOrCtrl+N'
        }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Electron Docs',
          click: function() { require('electron').shell.openExternal('http://electron.atom.io') }
        }
      ]
    }
  ];

  if (process.platform == 'darwin') {
    var name = remote.app.getName();
    template.unshift({
      label: name,
      submenu: [
        {
          label: 'About ' + name,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() { app.quit(); }
        }
      ]
    });
    // Window menu.
    template[3].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    );
  }

  var menu = Menu.buildFromTemplate(menu_template);
  Menu.setApplicationMenu(menu);
};