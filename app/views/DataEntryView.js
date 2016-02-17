var fs = require('fs');

var Template = require('../util/Template');
var TelemetryData = require('../models/TelemetryData')
var Logger = require('../util/Logger');
var app_config = require('./config/application_config.js');

module.exports = function(Marionette) {

  return Marionette.ItemView.extend({
    template: Template('DataEntryView'),
    className: 'gainsAdjustView',

    ui: {
      name_field: "#fileName",
      comment_field: "#comment",
      save_button: "#saveComment"
    },

    events: {
      "click #saveComment": "saveData",
    },

    saveData: function(event) {
      var d = new Date();
      var loc = "./" + app_config.get('log_dir') + "/data_entries/" + this.ui.name_field.val() + "_" + d.getDate() + ".txt";
      var content = "Comment: " + this.ui.comment_field.val() + "\r\nData Stream: " + JSON.stringify(TelemetryData.current_state);

      fs.writeFile(loc, content, 'utf8', function(err) {

      });
      Logger.debug("file " + this.ui.name_field.val() + " written to " + loc);
    }
  });
};