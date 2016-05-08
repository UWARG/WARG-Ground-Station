//our new-window.js file (the window entry point)
var gui=require('nw.gui');
var appSettingsView=require('./app/views/AppSettingsView')(Marionette,$);
var WindowShortcuts=require('./app/util/WindowShortcuts')(Mousetrap, gui);

$(document).ready(function(){
  $('body').append((new appSettingsView()).render().$el);
});