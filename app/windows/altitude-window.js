var AltitudeWindow = require('../../app/views/AltitudeWindow')(Marionette, Backbone);
var WindowShortCuts = require('../../app/core/WindowShortcuts');

WindowShortCuts.init(Mousetrap);

var window_view = new AltitudeWindow();

$(document).ready(function(){
  $('body').append(window_view.render().$el);
});

//call the destroy method to get rid of any event listeners that we're no longer going to be using
window.onbeforeunload = (e) => {
  window_view.destroy();
  e.returnValue = true;
}