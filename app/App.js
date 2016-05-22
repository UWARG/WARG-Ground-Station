// var app_config=require('./config/application-config');
// var Logger=require('./app/util/Logger');
//
// var Network=require('./app/Network');
// var StatusManager=require('./app/StatusManager');
// var TelemetryData=require('./app/models/TelemetryData');
// var AircraftStatus=require('./app/AircraftStatus'); //initialize aircraft status manager
// var PathManager=require('./app/map/PathManager');
// var Commands=require('./app/models/Commands');
// var network_config=require('./config/network-config');
//
// var SafetyMarkers=require('./app/models/SafetyMarkers');
//
// var app={};
// var Menu=require('./app/core/Menu');
// Menu.initialize();

var MainLayoutView=require('./app/views/MainLayoutView')(Marionette,$,L,window);

$(document).ready(function(){
  $('body').append((new MainLayoutView()).render().$el);
});

//var DataRelay=require('./app/connections/DataRelay')(); //connect to the data relay station and start parsing data
//var Multiecho=require('./app/connections/Multiecho')(); //initialize multiecho connection and start parsing data
