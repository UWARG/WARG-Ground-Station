//our new-window.js file (the window entry point)
var gui=require('nw.gui');
var networkSettingsView=require('./app/views/NetworkSettingsView')(Marionette,$);
var WindowShortcuts=require('./app/util/WindowShortcuts')(Mousetrap, gui);

$(document).ready(function(){
  $('body').append((new networkSettingsView()).render().$el);
});