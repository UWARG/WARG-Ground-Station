var DataView = require('../../app/views/DataView')(Marionette, Backbone);
var WindowShortcuts = require('../../app/core/WindowShortcuts');

WindowShortcuts.init(Mousetrap);

var window_view = new DataView();

$(document).ready(function () {
  $('body').append(window_view.render().$el);
});

//call the destroy method to get rid of any event listeners that we're no longer going to be using
window.onbeforeunload = (e) => {
  window_view.destroy();
  e.returnValue = true;
}