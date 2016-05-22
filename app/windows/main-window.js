var MainLayoutView = require('../../app/views/MainLayoutView')(Marionette, $, L, window);
var window_view = new MainLayoutView();

//render the view on the window
$(document).ready(function () {
  $('body').append(window_view.render().$el);
});

//call the destroy method to get rid of any event listeners that we're no longer going to be using
window.onbeforeunload = (e) => {
  window_view.destroy();
  e.returnValue = true;
};

var DataRelay = require('../../app/connections/DataRelay').init(); //connect to the data relay station and start parsing data