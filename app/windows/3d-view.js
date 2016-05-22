var gui=require('nw.gui');

var threeDView=require('./app/views/3dView')(Marionette,THREE,window);
var WindowShortcuts=require('./app/util/WindowShortcuts')(Mousetrap, gui);

$(document).ready(function(){
  $('body').append((new threeDView()).render().$el);
});