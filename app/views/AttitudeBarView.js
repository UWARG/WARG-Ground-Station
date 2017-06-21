/**
 * @author Bingzheng Feng
 * @module views/AttitudeBarView
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
    template: Template('AttitudeBarView'),
    className: 'attitudeBarView',

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
      this.degree_or_rad = false; // false stands for degree
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
        var roll_degree = Number(val).toFixed(2);
        var roll_radius = (Number(val)/180*Math.PI).toFixed(2);
        this.ui.roll_rate_deg.text(roll_degree);
        this.ui.roll_rate_rad.text(roll_radius);
        if(!this.degree_or_rad){
          amount = 200 - Number(val)*100;
          this.ui.roll_front.css("height", amount.toString()+"px");
          this.ui.roll_front.text(roll_degree.toString());
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
        var pitch_degree = Number(val).toFixed(2);
        var pitch_radius = (Number(val)/180*Math.PI).toFixed(2);
        this.ui.pitch_rate_deg.text(pitch_degree);
        this.ui.pitch_rate_rad.text(pitch_radius);
        if(!this.degree_or_rad){
          amount = 200 - Number(val)*100;
          this.ui.pitch_front.css("height", amount.toString()+"px");
          this.ui.pitch_front.text(pitch_degree.toString());
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
        var yaw_degree = Number(val).toFixed(2);
        var yaw_radius = (Number(val)/180*Math.PI).toFixed(2);
        this.ui.yaw_rate_deg.text(yaw_degree);
        this.ui.yaw_rate_rad.text(yaw_radius);
        var amount;
        if(!this.degree_or_rad){
          amount = 200 - Number(val)*100;
          this.ui.yaw_front.css("height", amount.toString()+"px");
          this.ui.yaw_front.text(yaw_degree.toString());
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