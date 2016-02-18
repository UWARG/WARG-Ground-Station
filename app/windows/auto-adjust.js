var gui = require('nw.gui');

var AutoAdjustView = require('./app/views/AutoAdjustView')(Marionette);
var WindowShortcuts = require('./app/util/WindowShortcuts')(Mousetrap, gui);

$(document).ready(function () {
    $('body').append((new AutoAdjustView()).render().$el);
});