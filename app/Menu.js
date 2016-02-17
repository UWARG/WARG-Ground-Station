//The reason we are injecting gui and not calling require on nw.gui is because this script is executed within a node context and thus doesnt have access to nw.gui
var Logger=require('./util/Logger');

module.exports=function(gui){
	// Create the main application menu
	var main_menu = new gui.Menu({ type: 'menubar' });

	// ====File Submenu===
	var file_submenu = new gui.Menu();

	file_submenu.append(new gui.MenuItem({ 
	  label: 'Import PID Gains'
	}));
	file_submenu.append(new gui.MenuItem({ 
	  label: 'Import Path'
	}));
	file_submenu.append(new gui.MenuItem({ 
	  label: 'Import Settings'
	}));
	file_submenu.append(new gui.MenuItem({ 
	  label: 'Export PID Gains'
	}));
	file_submenu.append(new gui.MenuItem({ 
	  label: 'Export Path'
	}));
	file_submenu.append(new gui.MenuItem({ 
	  label: 'Save Settings as...'
	}));
	file_submenu.append(new gui.MenuItem({ 
	  label: 'Exit',
	  tooltip:"Closes all the windows and exits the program safely",
	  click: function(){
	    Logger.debug('Closing all windows!');
	    gui.App.closeAllWindows();
	  }
	}));

	// Append file menu as a Submenu
	main_menu.append(
	    new gui.MenuItem({
	        label: 'File',
	        submenu: file_submenu 
	    })
	);

	// ===Window Submenu ===
	var window_submenu=new gui.Menu();

	window_submenu.append(new gui.MenuItem({
	  label:'Console',
	  type:'checkbox',
    click: function(){
      gui.Window.open('./windows/console.html',{
       focus: true,
       position: 'center',
       width: 900,
       height: 500,
       toolbar: false
      });
      Logger.debug('Opening Console window');
    },
    modifiers: 'ctrl-shift',
    key: 'c'
	}));

	window_submenu.append(new gui.MenuItem({
	  label:'3D View',
	  type:'checkbox',
    click: function(){
      gui.Window.open('./windows/3dView.html',{
       focus: true,
       position: 'center',
       width: 900,
       height: 500,
       toolbar: false
      });
      Logger.debug('Opening 3D View window');
    },
    modifiers: 'ctrl-shift',
    key: 'v'
	}));

	window_submenu.append(new gui.MenuItem({
	  label:'Autonomous Level',
	  type:'checkbox'
	}));
	window_submenu.append(new gui.MenuItem({
	  label:'Gains Adjust',
	  type:'checkbox',
    click: function(){
      gui.Window.open('./windows/gainsAdjust.html',{
       focus: true,
       position: 'center',
       width: 1100,
       height: 550,
       toolbar: false
      });
      Logger.debug('Opening gains adjust window');
    },
    modifiers: 'ctrl-shift',
    key: 'g'
	}));
	window_submenu.append(new gui.MenuItem({
	  label:'Data Entry',
	  type:'checkbox'
	}));
	window_submenu.append(new gui.MenuItem({
	  label:'Altitude Graph Entry',
	  type:'checkbox'
	}));

	// Append window menu as a Submenu
	main_menu.append(
	    new gui.MenuItem({
	        label: 'Window',
	        submenu: window_submenu
	    })
	);

	// ===Settings Submenu ===
	var settings_submenu=new gui.Menu();

	settings_submenu.append(new gui.MenuItem({
	  label:'Network Settings',
    type: 'checkbox',
    click: function(){
      gui.Window.open('./windows/networkSettings.html',{
       focus: true,
       position: 'center',
       width: 600,
       height: 500,
       toolbar: false
      });
      Logger.debug('Opening network settings window');
    },
    modifiers: 'ctrl-shift',
    key: 'n'
	}));
	settings_submenu.append(new gui.MenuItem({
	  label:'App Settings',
    type: 'checkbox',
    click: function(){
      gui.Window.open('./windows/appSettings.html',{
       focus: true,
       position: 'center',
       width: 600,
       height: 700,
       toolbar: false
      });
      Logger.debug('Opening app settings window');
    },
    modifiers: 'ctrl-shift',
    key: 's'
	}));
	
	// Append settings menu as a Submenu
	main_menu.append(
	    new gui.MenuItem({
	        label: 'Settings',
	        submenu: settings_submenu
	    })
	);

	// ===Help Submenu ===
	var help_submenu=new gui.Menu();

	help_submenu.append(new gui.MenuItem({
	  label:'About',
	  click:function(){

	  }
	}));

	help_submenu.append(new gui.MenuItem({
	  label:'Documentation',
	  click:function(){
	  	// Create a new window and get it
		var documentation_window = gui.Window.open('http://www.uwarg.com/projects/groundstation/',{
			focus: true
		});
		Logger.debug('Opening documentation window');
	  },
	  key:'F1'
	}));
	
	// Append settings menu as a Submenu
	main_menu.append(
	    new gui.MenuItem({
	        label: 'Help',
	        submenu: help_submenu
	    })
	);

	return main_menu;
};