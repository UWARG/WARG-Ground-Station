var gui=require('nw.gui');
var simulationModeView=require('./app/views/SimulationModeView')(Marionette,$);
var WindowShortcuts=require('./app/util/WindowShortcuts')(Mousetrap, gui);

$(document).ready(function(){
  $('body').append((new simulationModeView()).render().$el);
});