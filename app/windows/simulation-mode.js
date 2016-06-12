var SimulationModeView = require('../../app/views/SimulationModeView')(Marionette, $);
var window_view = new SimulationModeView();
var WindowShortcuts = require('../../app/core/WindowShortcuts');

//render the view on the window
$(document).ready(function () {
  $('body').append(window_view.render().$el);
});

//call the destroy method to get rid of any event listeners that we're no longer going to be using
window.onbeforeunload = (e) => {
  window_view.destroy();
  e.returnValue = true;
};

WindowShortcuts.init(Mousetrap);