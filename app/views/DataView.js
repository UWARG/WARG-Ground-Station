/**
 * @author Serge Babayan
 * @module views/DataView
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Displays the current data packet in the TelemetryData module in a nice form
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('DataView'), //name of the file in the views folder at the project root
    className: 'exampleView', //this is the class name the injected div will have (refer to this class in your style sheets)

    ui: {
      data: '#data',
      current_date: '#current-date'
    },

    initialize: function () {
      this.telemetryCallback = null;
    },
    onRender: function () {
      this.telemetryCallback = this.dataCallback.bind(this);
      TelemetryData.on('data_received', this.telemetryCallback);
    },

    dataCallback: function (data) {
      this.ui.data.text(JSON.stringify(data, null, 2));
      this.ui.current_date.text(new Date());
    },
    onBeforeDestroy: function () {
      //Todo: need to destroy the callback here
    }
  });
};