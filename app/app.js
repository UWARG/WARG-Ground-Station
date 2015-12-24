// Load native UI library
var gui = require('nw.gui');
var app_config=require('./config/application-config');
var Logger=require('./app/logger');

if(app_config.mode==='development'){
  //require('./app/livereload').start();
  Logger.debug('Live reload server started!');
}

// Create the main menu
var main_menu = new gui.Menu({ type: 'menubar' });

// Create sub-menu
var file_submenu = new gui.Menu();

file_submenu.append(new gui.MenuItem({ 
  label: 'Custom Menu Item 1',
  tooltip:"This is an example tooltip",
  click:function(){
    alert('clicked the first menu item');
  },
  key:'s',
  modifiers: "ctrl-shift"
}));

file_submenu.append(new gui.MenuItem({ 
  label: 'Custom Menu Item 2',
  type:"checkbox"
}));

// Append MenuItem as a Submenu
main_menu.append(
    new gui.MenuItem({
        label: 'File',
        submenu: file_submenu // menu elements from menuItems object
    })
);

// Append Menu to Window
gui.Window.get().menu = main_menu;