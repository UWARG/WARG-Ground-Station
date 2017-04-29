/**
 * @author Mariel Yonnadam
 * @module views/AltitudeView
 * @requires util/Logger
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for displaying the aircraft's altitude
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Logger = remote.require('./app/util/Logger');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('AltitudeVerticalView'),
    className: 'altitudeVerticalView',

    ui: {
      max_altitude_text: '.max-altitude-text',
      current_altitude_text: '.current-altitude-text',
      altitude_bar: '.altitude-vertical-value'
    },

    initialize: function () {
      this.max_altitude = 200;
      this.telemetry_callback = null;
    },
    onRender: function () {
      this.telemetry_callback = this.telemetryCallback.bind(this);
      TelemetryData.addListener('aircraft_position', this.telemetry_callback);
      this.ui.max_altitude_text.text(this.max_altitude + "m");
    },
    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_position', this.telemetry_callback);
    },
    telemetryCallback: function (data) {
      this.setAltitude(data.altitude);
    },
    setAltitude: function (altitude) {
      if (altitude !== null) {
        var int_alt = Number(altitude);
        var barHeight = (int_alt / this.max_altitude) * 100;
        this.ui.current_altitude_text.text(int_alt.toFixed(2) + "m");
        this.ui.altitude_bar.css("height", barHeight + "%");
        // Set the color depending on the interval
        // Would probably be better to have these as constants instead of magic values
        if (barHeight < 33) {
          this.ui.altitude_bar.css("background-color", "red");
        } else if (barHeight < 66) {
          this.ui.altitude_bar.css("background-color", "yellow");
        } else {
          this.ui.altitude_bar.css("background-color", "green");
        }
      }
    }
  });
};
