var gui=require('nw.gui');

var radioInputView=require('./app/views/RadioInputView')(Marionette);
var WindowShortcuts=require('./app/util/WindowShortcuts')(Mousetrap, gui);

$(document).ready(function(){
  $('body').append((new radioInputView()).render().$el);
});