//our new-window.js file (the window entry point)
var dataView=require('./app/views/DataView')(Marionette);

$(document).ready(function(){
  $('body').append((new dataView()).render().$el);
});