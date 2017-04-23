/**
 * @author Serge Babayan
 * @module views/ThrottleView
 * @requires models/Commands
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires util/Logger
 * @requires util/Validator
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description View that displays the aircraft's throttle, flap, and attitude rate values
 */

var remote = require('electron').remote;
var Logger = remote.require('./app/util/Logger');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Validator = require('../util/Validator');
var Commands = remote.require('./app/models/Commands');
var Template = require('../util/Template');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('ThrottleView'),
    className: 'throttleView',

    ui: {
      throttle: '.throttle-value',
      yaw: '.yaw-value',
      yaw_setpoint: '.yaw-setpoint-value',
      flap: '.flap-value',
      roll_rate_rad: '.roll-rate-value-rad',
      pitch_rate_rad: '.pitch-rate-value-rad',
      yaw_rate_rad: '.yaw-rate-value-rad',
      roll_rate_deg: '.roll-rate-value-deg',
      pitch_rate_deg: '.pitch-rate-value-deg',
      yaw_rate_deg: '.yaw-rate-value-deg',
      throttle_input: '.throttle-form input',
      flap_input: '.flap-form input'
    },
    events: {
      'submit .flap-form': 'sendSetFlapCommand',
      'submit .throttle-form': 'sendSetThrottleCommand'
    },
    initialize: function () {
      this.aircraft_setpoints_callback = this.aircraftSetpointsCallback.bind(this);
      this.aircraft_position_callback = this.aircraftPositionCallback.bind(this);
      TelemetryData.addListener('aircraft_setpoints', this.aircraft_setpoints_callback);
      TelemetryData.addListener('aircraft_position', this.aircraft_position_callback);
    },

    aircraftSetpointsCallback: function(data){
      this.setThrottle(data.throttle_setpoint);
      // this.setFlap(data.flap_setpoint);
    },

    aircraftPositionCallback: function(data){
      this.setRollRate(data.roll_rate);
      this.setYawRate(data.yaw_rate);
      this.setPitchRate(data.pitch_rate);
    },

    onBeforeDestroy: function(){
      TelemetryData.removeListener('aircraft_setpoints', this.aircraft_setpoints_callback);
      TelemetryData.removeListener('aircraft_position', this.aircraft_position_callback);
    },

    setThrottle: function (throttle) {
      if (throttle !== null) {
        this.ui.throttle.text(((throttle + 1024) * 100 / 2048).toFixed(1));//-1024 represents 0%
      }
    },

    setRollRate: function (val) {
      if (val !== null) {
        this.ui.roll_rate_rad.text(Number(val).toFixed(2));
        this.ui.roll_rate_deg.text((Number(val)*180/Math.PI).toFixed(2));
      }
    },

    setPitchRate: function (val) {
      if (val !== null) {
        this.ui.pitch_rate_rad.text(Number(val).toFixed(2));
        this.ui.pitch_rate_deg.text((Number(val)*180/Math.PI).toFixed(2));
      }
    },

    setYawRate: function (val) {
      if (val !== null) {
        this.ui.yaw_rate_rad.text(Number(val).toFixed(2));
        this.ui.yaw_rate_deg.text((Number(val)*180/Math.PI).toFixed(2));
      }
    },

    setFlap: function (flap) {
      if (flap !== null) {
        this.ui.flap.text((flap + 1024) * 100 / 2048).toFixed(1);//-1024 represents 0%
      }
    },

    setFlap: function (flap) {
      if (flap !== null) {
        this.ui.flap.text((flap + 1024) * 100 / 2048).toFixed(1);//-1024 represents 0%
      }
    },

    setFlap: function (flap) {
      if (flap !== null) {
        this.ui.flap.text((flap + 1024) * 100 / 2048).toFixed(1);//-1024 represents 0%
      }
    },

    setFlap: function (flap) {
      if (flap !== null) {
        this.ui.flap.text((flap + 1024) * 100 / 2048).toFixed(1);//-1024 represents 0%
      }
    },

    sendSetThrottleCommand: function (e) {
      e.preventDefault();
      Commands.sendThrottle(this.ui.throttle_input.val());
      this.ui.throttle_input.val('');
    },
    sendSetFlapCommand: function (e) {
      e.preventDefault();
      Commands.sendFlap(this.ui.flap_input.val());
      this.ui.flap_input.val('');
    }
  });
};