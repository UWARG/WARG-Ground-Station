//our new-window.js file (the window entry point)
var appSettingsView=require('./app/views/AppSettingsView')(Marionette);

$(document).ready(function(){
  $('body').append((new appSettingsView()).render().$el);
});