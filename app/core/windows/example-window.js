//our new-window.js file (the window entry point)
var windowView=require('./app/views/newWindowView')(Marionette);

$(document).ready(function(){
  $('body').append((new windowView()).render().$el);
});