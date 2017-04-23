/**
 * @author Serge Babayan
 * @module views/AltitudeView
 * @requires models/Commands
 * @requires util/Validator
 * @requires util/Logger
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for displaying a the aircrafts altitude, air and ground speed via dials
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Logger = remote.require('./app/util/Logger');
var Validator = require('../util/Validator');
var Commands = remote.require('./app/models/Commands');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('AltitudeView'),
    className: 'altitudeView',

    ui: {
      altitude_dials: '.dial-picture',
      altitude_hand: '.height-dial .dial-hand',
      altitude_text: '.height-dial .current-value',
      altitude_setpoint_text: '.height-dial .auto-pilot-setpoint',
      altitude_input: '.height-dial input',
      ground_speed_hand: '.ground-speed-dial .dial-hand',
      ground_speed_text: '.ground-speed-dial .current-value',
      ground_speed_text_kmh: '.ground-speed-dial .current-valuekmh',
      air_speed_hand: '.air-speed-dial .dial-hand',
      air_speed_text: '.air-speed-dial .current-value',
      air_speed_text_kmh: '.air-speed-dial .current-valuekmh',
    },

    events: {
      'submit .height-dial form': 'sendAltitudeSetpointCommand'
    },

    initialize: function () {
      //For drawing the dial correctly
      this.max_ground_speed = 40;
      this.max_air_speed = 40;
      this.max_altitude = 200;

      this.telemetry_callback = null;
      this.first_resize = true;
    },
    onRender: function () {
      this.ui.altitude_dials.parent().resize(this.setCanvasDimensions.bind(this));

      this.telemetry_callback = this.telemetryCallback.bind(this);
      TelemetryData.addListener('aircraft_position', this.telemetry_callback);
    },
    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_position', this.telemetry_callback);
    },
    telemetryCallback: function (data) {
      this.setAltitude(data.altitude);
      this.setAltitudeSetpoint(data.altitude_setpoint);
      this.setGroundspeed(data.ground_speed);
      this.setAirspeed(data.airspeed);
    },
    setCanvasDimensions: function () {
      var canvas_dimensions = Math.min(this.ui.altitude_dials.parent().width() - 12, this.ui.altitude_dials.parent().height() - 105);
      if ((canvas_dimensions && canvas_dimensions > 100) || this.first_resize) {
        this.ui.altitude_dials.css({
          width: canvas_dimensions,
          height: canvas_dimensions
        });
        this.first_resize = false;
      }
    },
    setAltitude: function (altitude) {
      if (altitude !== null) {
        var int_alt = Number(altitude);
        var degrees = (int_alt / this.max_altitude) * 360;
        this.ui.altitude_hand.css('transform', 'rotate(' + degrees + 'deg)');
        this.ui.altitude_text.text(int_alt.toFixed(1));
      }
    },
    setGroundspeed: function (speed) {
      if (speed !== null) {
        var int_speed = Number(speed);
        var degrees = (int_speed / this.max_ground_speed) * 360;
        this.ui.ground_speed_hand.css('transform', 'rotate(' + degrees + 'deg)');
        this.ui.ground_speed_text.text(int_speed.toFixed(1));
        this.ui.ground_speed_text_kmh.text((int_speed * 3.6).toFixed(1));
      }
    },
    setAirspeed: function (speed) {
      if (speed !== null) {
        var int_speed = Number(speed);
        var degrees = (int_speed / this.max_ground_speed) * 360;
        this.ui.air_speed_hand.css('transform', 'rotate(' + degrees + 'deg)');
        this.ui.air_speed_text.text(int_speed.toFixed(1));
        this.ui.air_speed_text_kmh.text((int_speed * 3.6).toFixed(1));
      }
    },
    setAltitudeSetpoint: function (altitude) {
      if (altitude !== null) {
        this.ui.altitude_setpoint_text.text(altitude);
      }
    },
    sendAltitudeSetpointCommand: function (e) {
      e.preventDefault();
      Commands.sendAltitude(this.ui.altitude_input.val());
      this.ui.altitude_input.val('');
    }
  });
};