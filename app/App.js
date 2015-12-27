var gui = require('nw.gui');
var app_config=require('./config/application-config');
var Logger=require('./app/util/Logger');

var Network=require('./app/Network');
var StatusManager=require('./app/StatusManager');
var TelemetryData=require('./app/models/TelemetryData');

var DataRelay=require('./app/connections/DataRelay')(); //connect to the data relay station and start parsing data
var Multiecho=require('./app/connections/Multiecho')(); //initialize multiecho connection and start parsing data

var app={};

app.menu=require('./app/Menu')(gui);
app.windows=[]; //an array of all the windows open

// Append Menu to Window
gui.Window.get().menu = app.menu;

var MainLayoutView=require('./app/views/MainLayoutView')(Marionette,$,fabric);

$(document).ready(function(){
  $('body').append((new MainLayoutView()).render().$el);
});