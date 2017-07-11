/**
 * @author Serge Babayan & Rosa
 * @module views/AttitudeView
 * @requires models/Commands
 * @requires util/Validator
 * @requires util/Logger
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for displaying a the aircraft's attitude via dials (heading, roll, pitch)
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Logger = remote.require('./app/util/Logger');
var Validator = require('../util/Validator');
var Commands = remote.require('./app/models/Commands');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('AttitudeView'),
    className: 'attitudeView',

    ui: {
      attitude_dials: '.dial-picture',
      pitch_dial: '.pitch-dial .dial-picture .fluid',
      roll_dial: '.roll-dial .dial-picture .fluid',
      heading_dial: '.heading-dial .dial-picture .image-overlay',
      horizon_dial: '.horizon-dial .dial-picture .fluid',
      pitch_text: '.pitch-dial .current-value',
      roll_text: '.roll-dial .current-value',
      heading_text: '.heading-dial .current-value',
      pitch_setpoint: '.pitch-dial .auto-pilot-setpoint',
      roll_setpoint: '.roll-dial .auto-pilot-setpoint',
      heading_setpoint: '.heading-dial .auto-pilot-setpoint',
      roll_input: '.roll-dial form input',
      pitch_input: '.pitch-dial form input',
      heading_input: '.heading-dial form input',
      //yaw
      yaw_dial: '.yaw-dial .dial-picture .image-overlay',
      yaw_text:  '.yaw-dial .current-value',
      yaw_setpoint: '.yaw-dial .auto-pilot-setpoint',
      yaw_input: 'yaw-dial form input'
    },

    events: {
      'submit .roll-dial form': 'sendSetRoll',
      'submit .pitch-dial form': 'sendSetPitch',
      'submit .heading-dial form': 'sendSetHeading',
      //yaw
      'submit .yaw-dial form': 'sendSetYaw'
    },

    initialize: function () {
      this.current_pitch = null;
      this.current_roll = null;
      this.current_heading = null;
      //yaw
      this.current_yaw = null;

      this.telemetry_callback = null;
    },
    onRender: function () {
      this.ui.attitude_dials.parent().resize(this.setCanvasDimensions.bind(this));

      this.telemetry_position_callback = this.telemetryPositionCallback.bind(this);
      this.telemetry_setpoints_callback = this.telemetrySetpointsCallback.bind(this);
      TelemetryData.addListener('aircraft_position', this.telemetry_position_callback);
      TelemetryData.addListener('aircraft_setpoints', this.telemetry_setpoints_callback);
    },
    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_position', this.telemetry_position_callback);
      TelemetryData.removeListener('aircraft_setpoints', this.telemetry_setpoints_callback);
    },
    telemetryPositionCallback: function (data) {
      this.setPitch(data.pitch);
      this.setRoll(data.roll);
      this.setHeading(data.heading);
      //yaw
      this.setYaw(data.yaw);
    },
    telemetrySetpointsCallback: function(data){
      this.setPitchSetpoint(data.pitch_setpoint);
      this.setRollSetpoint(data.roll_setpoint);
      this.setHeadingSetpoint(data.heading_setpoint);
      //yaw
      this.setYawSetpoint(data.int_yaw_setpoint);
    },
    setCanvasDimensions: function () {
      var canvas_dimensions = Math.min(this.ui.attitude_dials.parent().width() - 12, this.ui.attitude_dials.parent().height() - 105);
      if (canvas_dimensions && canvas_dimensions > 100) {
        this.ui.attitude_dials.css({
          width: canvas_dimensions,
          height: canvas_dimensions
        });
      }
    },
    setPitch: function (pitch) {
      if (pitch !== null) {
        this.ui.pitch_text.text(pitch.toFixed(1));
        var pitchPercent = (pitch/ 90).toFixed(2);
        var dial_height = this.ui.pitch_dial.parent().height() / 2;
        this.ui.horizon_dial.css('height', Math.round(dial_height + dial_height * pitchPercent) + 'px');
        this.ui.pitch_dial.css('transform', 'rotate(' + pitch + 'deg) scale(2)');
      }
    },
    setRoll: function (roll) {
      if (roll !== null) {
        this.ui.roll_text.text(roll.toFixed(1));
        this.ui.horizon_dial.css('transform', 'rotate(' + -1 * roll + 'deg) scale(2)'); //multiply by negative 1 because thats how roll works on a horizon dial
        this.ui.roll_dial.css('transform', 'rotate(' + roll + 'deg) scale(2)');
      }
    },
    setHeading: function (heading) {
      if (heading !== null) {
        this.ui.heading_text.text(heading.toFixed(1));
        this.ui.heading_dial.css('transform', 'rotate(' + heading + 'deg)');
      }
    },
    //yaw
    setYaw: function (yaw) {
      if (yaw !== null) {
        this.ui.yaw_text.text(yaw.toFixed(1));
        this.ui.yaw_dial.css('transform', 'rotate(' + yaw + 'deg)');
      }
    },
    setRollSetpoint: function (roll) {
      if (roll !== null) {
        this.ui.roll_setpoint.text(Number(roll).toFixed(2));
      }
    },
    setPitchSetpoint: function (pitch) {
      if (pitch !== null) {
        this.ui.pitch_setpoint.text(Number(pitch).toFixed(2));
      }
    },
    setHeadingSetpoint: function (heading) {
      if (heading !== null) {
        this.ui.heading_setpoint.text(Number(heading).toFixed(2));
      }
    },
    //yaw
    setYawSetpoint: function (yaw) {
      if (yaw !== null) {
        this.ui.yaw_setpoint.text(Number(yaw).toFixed(2));
      }
    },
    sendSetPitch: function (e) {
      e.preventDefault();
      Commands.sendPitch(this.ui.pitch_input.val());
      this.ui.pitch_input.val('');
    },
    sendSetRoll: function (e) {
      e.preventDefault();
      Commands.sendRoll(this.ui.roll_input.val());
      this.ui.roll_input.val('');
    },
    sendSetHeading: function (e) {
      e.preventDefault();
      Commands.sendHeading(this.ui.heading_input.val());
      this.ui.heading_input.val('');
    },
    //yaw
    sendSetYaw: function (e) {
      e.preventDefalt();
      Commands.sendYaw(this.ui.yaw_input.val());
      this.ui.yaw_input.val('');
    }
  });
};
