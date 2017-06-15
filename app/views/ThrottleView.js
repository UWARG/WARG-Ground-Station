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
 * @description View that displays the aircraft's throttle, flap
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
      flap: '.flap-value',
      throttle_input: '.throttle-form input',
      flap_input: '.flap-form input'
    },
    events: {
      'submit .flap-form': 'sendSetFlapCommand',
      'submit .throttle-form': 'sendSetThrottleCommand'
    },
    initialize: function () {
      this.aircraft_setpoints_callback = this.aircraftSetpointsCallback.bind(this);
      TelemetryData.addListener('aircraft_setpoints', this.aircraft_setpoints_callback);
    },

    aircraftSetpointsCallback: function(data){
      this.setThrottle(data.throttle_setpoint);
      // this.setFlap(data.flap_setpoint);
    },

    onBeforeDestroy: function(){
      TelemetryData.removeListener('aircraft_setpoints', this.aircraft_setpoints_callback);
    },

    setThrottle: function (throttle) {
      if (throttle !== null) {
        this.ui.throttle.text(((throttle + 1024) * 100 / 2048).toFixed(1));//-1024 represents 0%
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