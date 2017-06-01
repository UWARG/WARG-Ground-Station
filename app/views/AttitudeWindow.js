/**
 * @author Bingzheng Feng
 * @module views/AttitudeWindow
 * @requires models/Commands
 * @requires util/Validator
 * @requires util/Logger
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for displaying and setting the aircraft's attitude rate (roll rate, pitch rate, yaw rate)
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Logger = remote.require('./app/util/Logger');
var Validator = require('../util/Validator');
var Commands = remote.require('./app/models/Commands');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('AttitudeWindow'),
    className: 'attitudeWinodw',

    ui: {
      pitch_rate_rad: '.pitch.value-rad',
      pitch_rate_deg: '.pitch.value-deg',
      pitch_front: '.pitch.block.front',
      pitch_input: '.input.pitch',
      yaw: '.yaw-value',
      yaw_setpoint: '.yaw-setpoint-value',
      yaw_rate_rad: '.yaw.value-rad',
      yaw_rate_deg: '.yaw.value-deg',
      yaw_front: '.yaw.block.front',
      yaw_input: '.input.yaw',
      roll_rate_rad: '.roll.value-rad',
      roll_rate_deg: '.roll.value-deg',
      roll_front: '.roll.block.front',
      roll_input: '.input.roll',
    },

    events: {
      'click .send.roll': 'sendRollRate',
      'click .send.pitch': 'sendPitchRate',
      'click .send.yaw': 'sendYawRate',
    },

    initialize: function () {
      this.DegreeOrRad = false; // false stands for degree
      this.aircraft_position_callback = this.aircraftPositionCallback.bind(this);
      TelemetryData.addListener('aircraft_position', this.aircraft_position_callback);
    },
    
    aircraftPositionCallback: function(data){
      this.setRollRate(data.roll_rate);
      this.setYawRate(data.yaw_rate);
      this.setPitchRate(data.pitch_rate);
    },
    /*
    onRender: function () {
      //this.ui.attitude_dials.parent().resize(this.setCanvasDimensions.bind(this));

      this.telemetry_position_callback = this.telemetryPositionCallback.bind(this);
      this.telemetry_setpoints_callback = this.telemetrySetpointsCallback.bind(this);
      TelemetryData.addListener('aircraft_position', this.telemetry_position_callback);
      TelemetryData.addListener('aircraft_setpoints', this.telemetry_setpoints_callback);
    },
    */
    onBeforeDestroy: function(){
      TelemetryData.removeListener('aircraft_position', this.aircraft_position_callback);
    },
    setRollRate: function (val) {
      if (val !== null) {
        var rollDegree = Number(val).toFixed(2);
        var rollRadius = (Number(val)/180*Math.PI).toFixed(2);
        this.ui.roll_rate_deg.text(rollDegree);
        this.ui.roll_rate_rad.text(rollRadius);
        if(!this.DegreeOrRad){
          amount = 200 - Number(val)*100;
          this.ui.roll_front.css("height", amount.toString()+"px");
          this.ui.roll_front.text(rollDegree.toString());
        }
      }
    },
    sendRollRate: function(){
      var rate = this.ui.roll_input.val();
      if(rate==null) {
        rate = 0;
      }else{
        rate = rate %360;
      }
      Commands.sendRollRate(rate);
    },

    setPitchRate: function (val) {
      if (val !== null) {
        var pitchDegree = Number(val).toFixed(2);
        var pitchRadius = (Number(val)/180*Math.PI).toFixed(2);
        this.ui.pitch_rate_deg.text(pitchDegree);
        this.ui.pitch_rate_rad.text(pitchRadius);
        if(!this.DegreeOrRad){
          amount = 200 - Number(val)*100;
          this.ui.pitch_front.css("height", amount.toString()+"px");
          this.ui.pitch_front.text(pitchDegree.toString());
        }
      }
    },
    
    sendPitchRate: function(e){
      e.preventDefault();
      var rate = this.ui.pitch_input.val();
      if(rate==null) {
        rate = 0;
      }else{
        rate = rate %360;
      }
      Commands.sendPitchRate(rate);
    },

    setYawRate: function (val) {
      if (val !== null) {
        var yawDegree = Number(val).toFixed(2);
        var yawRadius = (Number(val)/180*Math.PI).toFixed(2);
        this.ui.yaw_rate_deg.text(yawDegree);
        this.ui.yaw_rate_rad.text(yawRadius);
        var amount;
        if(!this.DegreeOrRad){
          amount = 200 - Number(val)*100;
          this.ui.yaw_front.css("height", amount.toString()+"px");
          this.ui.yaw_front.text(yawDegree.toString());
        }
      }
    },
    
    sendYawRate: function(e){
      e.preventDefault();
      var rate = this.ui.yaw_input.val();
      if(rate==null) {
        rate = 0;
      }else{
        rate = rate %360;
      }
      console.log(Commands.sendYawRate(rate));
    },
  });
};