var gui=require('nw.gui');
var probeDropView=require('./app/views/ProbeDropView')(Marionette);
var WindowShortcuts=require('./app/util/WindowShortcuts')(Mousetrap, gui);

$(document).ready(function(){
  $('body').append((new probeDropView()).render().$el);
});