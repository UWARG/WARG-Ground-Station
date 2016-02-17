var fs = require('fs');
var mkdirp=require('mkdirp');
var path=require('path');

var Template = require('../util/Template');
var TelemetryData = require('../models/TelemetryData')
var Logger = require('../util/Logger');
var app_config = require('../../config/application-config');

var write_location=path.join(__dirname,'../../'+app_config.get('log_dir') + "data_entries/");

//create the data entry directory if it doesnt yet exist
mkdirp.sync(write_location);

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
      var loc = write_location + this.ui.name_field.val() + "_" + d.getDate() + ".txt";
      var content = "Comment: " + this.ui.comment_field.val() + "\r\nData Stream: " + JSON.stringify(TelemetryData.current_state);

      fs.writeFile(loc, content, 'utf8', function(err) {
        if(err){
          Logger.error('Error writing data entry to file: '+err);
        }
        else{
          Logger.debug("file " + this.ui.name_field.val() + " written to " + loc);
        }
      }); 
    }
  });
};