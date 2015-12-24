// Load native UI library
var gui = require('nw.gui');
var app_config=require('./config/application-config');
var Logger=require('./app/util/Logger');

if(app_config.mode==='development'){
  //require('./app/livereload').start();
  Logger.debug('Live reload server started!');
}

var app={};

app.menu=require('./app/Menu')(gui);

// Append Menu to Window
gui.Window.get().menu = app.menu;
gui.Window.get().on('focus',function(){
  console.log('focusing');
});
