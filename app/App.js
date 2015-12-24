var gui = require('nw.gui');
var app_config=require('./config/application-config');
var Logger=require('./app/util/Logger');

var app={};

app.menu=require('./app/Menu')(gui);
app.windows=[]; //an array of all the windows open

// Append Menu to Window
gui.Window.get().menu = app.menu;


var MainLayoutView=require('./app/MainLayoutView')(Marionette,_);

$(document).ready(function(){
  $('body').append((new MainLayoutView()).render().$el);
});

//Start the live reload server if in development mode
if(app_config.mode==='development'){
  require('./app/util/livereload').start();
  Logger.debug('Live reload server started!');
}