var gui = require('nw.gui');
var windowView = require('./app/views/AutoAdjustView')(Marionette);
var WindowShortcuts = require('./app/util/WindowShortcuts')(Mousetrap, gui);
$(document).ready(function () {
    $('body').append((new windowView()).render().$el);
});