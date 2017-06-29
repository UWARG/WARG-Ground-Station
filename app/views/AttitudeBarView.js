/**
 * @author Bingzheng Feng
 * @module views/AttitudeBarView
 * @requires models/Commands
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires util/Validator
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for displaying and setting the aircraft's attitude rate (roll rate, pitch rate, yaw rate)
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var Validator = require('../util/Validator');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Commands = remote.require('./app/models/Commands');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('AttitudeBarView'),
    className: 'attitudeBarView',

    ui: {
      pitch_rate: '#pitch-rate',
      pitch_front: '.pitch.block.front',
      pitch_input: '.pure-form .pitch',
      yaw_setpoint: '.yaw-setpoint-value',
      yaw_rate: '#yaw-rate',
      yaw_front: '.yaw.block.front',
      yaw_input: '.pure-form .yaw',
      roll_rate: '#roll-rate',
      roll_front: '.roll.block.front',
      roll_input: '.pure-form .roll',
      rad: '.rad',
      degree: '.degree',
    },

    events: {
      'click #send-roll-rate': 'sendRollRate',
      'click #send-pitch-rate': 'sendPitchRate',
      'click #send-yaw-rate': 'sendYawRate',
    },

    initialize: function () {
      this.is_rad = false; // false stands for degree
    },
    
    aircraftPositionCallback: function(data) {
      this.setRollRate(data.roll_rate);
      this.setYawRate(data.yaw_rate);
      this.setPitchRate(data.pitch_rate);
    },
    
    onRender: function () {
      this.aircraft_position_callback = this.aircraftPositionCallback.bind(this);
      TelemetryData.addListener('aircraft_position', this.aircraft_position_callback);
    },
    
    onBeforeDestroy: function() {
      TelemetryData.removeListener('aircraft_position', this.aircraft_position_callback);
    },
    setRollRate: function (val) {
      if (val !== null) {
        var roll_degree = Number(val).toFixed(2);
        var roll_radius = (Number(val)/180*Math.PI).toFixed(2);
        if(!this.is_rad) {
          this.ui.rad.css("display","none");
          this.ui.degree.css("display","inline");
          amount = Number(Math.abs(val))*100;
          if(val > 0) {
            this.ui.roll_front.css({"margin-top": (-200-amount).toString()+"px", "background-color": "rgba(122,244,122,1)"});
          } else {
            this.ui.roll_front.css({"margin-top": (-200).toString()+"px", "background-color": "rgba(244,122,122,1)"});
          }
          this.ui.roll_front.css("height", amount.toString()+"px");
          this.ui.roll_front.text(roll_degree.toString());
          this.ui.roll_rate.text(roll_degree.toString());
        }
      }
    },
    sendRollRate: function() {
      var rate = this.ui.roll_input.val();
      if(!Validator.isValidNumber(rate)) {
        rate = 0;
      } else {
        rate = rate %360;
      }
      Commands.sendRollRate(rate);
    },

    setPitchRate: function (val) {
      if (val !== null) {
        var pitch_degree = Number(val).toFixed(2);
        var pitch_radius = (Number(val)/180*Math.PI).toFixed(2);
        if(!this.is_rad) {
          this.ui.rad.css("display","none");
          this.ui.degree.css("display","inline");
          amount = Number(Math.abs(val))*100;
          if(val > 0) {
            this.ui.pitch_front.css({"margin-top": (-200-amount).toString()+"px", "background-color": "rgba(122,244,122,1)"});
          } else {
            this.ui.pitch_front.css({"margin-top": (-200).toString()+"px", "background-color": "rgba(244,122,122,1)"});
          }
          this.ui.pitch_front.css("height", amount.toString()+"px");
          this.ui.pitch_front.text(pitch_degree.toString());
          this.ui.pitch_rate.text(pitch_degree.toString());
        }
      }
    },
    
    sendPitchRate: function(e) {
      e.preventDefault();
      var rate = this.ui.pitch_input.val();
      if(!Validator.isValidNumber(rate)) {
        rate = 0;
      } else {
        rate = rate %360;
      }
      Commands.sendPitchRate(rate);
    },

    setYawRate: function (val) {
      if (val !== null) {
        var yaw_degree = Number(val).toFixed(2);
        var yaw_radius = (Number(val)/180*Math.PI).toFixed(2);
        var amount;
        if(!this.is_rad) {
          this.ui.rad.css("display","none");
          this.ui.degree.css("display","inline");
          amount = Number(Math.abs(val))*100;
          if(val > 0) {
            this.ui.yaw_front.css({"margin-top": (-200-amount).toString()+"px", "background-color": "rgba(122,244,122,1)"});
          } else {
            this.ui.yaw_front.css({"margin-top": (-200).toString()+"px", "background-color": "rgba(244,122,122,1)"});
          }
          this.ui.yaw_front.css("height", amount.toString()+"px");
          this.ui.yaw_front.text(yaw_degree.toString());
          this.ui.yaw_rate.text(yaw_degree.toString());
        }
      }
    },
    
    sendYawRate: function(e) {
      e.preventDefault();
      var rate = this.ui.yaw_input.val();
      if(!Validator.isValidNumber(rate)) {
        rate = 0;
      } else {
        rate = rate %360;
      }
    },
  });
};