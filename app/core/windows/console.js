//our new-window.js file (the window entry point)
var gui=require('nw.gui');

var consoleView=require('./app/views/ConsoleView')(Marionette);
var WindowShortcuts=require('./app/util/WindowShortcuts')(Mousetrap, gui);

$(document).ready(function(){
  $('body').append((new consoleView()).render().$el);
});