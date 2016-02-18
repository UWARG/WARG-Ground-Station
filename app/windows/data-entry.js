var gui = require('nw.gui');

var DataEntryView = require('./app/views/DataEntryView')(Marionette);
var WindowShortcuts = require('./app/util/WindowShortcuts')(Mousetrap, gui);

$(document).ready(function () {
    $('body').append((new DataEntryView()).render().$el);
});