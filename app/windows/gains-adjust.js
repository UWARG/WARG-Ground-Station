var gui=require('nw.gui');

var gainsAdjustView=require('./app/views/GainsAdjustView')(Marionette);
var WindowShortcuts=require('./app/util/WindowShortcuts')(Mousetrap, gui);

$(document).ready(function(){
  $('body').append((new gainsAdjustView()).render().$el);
});