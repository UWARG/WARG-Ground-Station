/**
 * @author Bingzheng Feng
 * @module views/ControlWindow
 * @requires models/Commands
 * @requires util/Validator
 * @requires util/Logger
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for displaying control pitch, yaw, roll
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Logger = remote.require('./app/util/Logger');
var Validator = require('../util/Validator');
var Commands = remote.require('./app/models/Commands');
var Channel_Conf = remote.require('./config/vehicle-config');
var PicPilot_Conf = remote.require('./config/picpilot-config');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('ControlWindow'),
    className: 'controlWinodw',

    ui: {
      front23: '.controlWindow.circle.front.twothree',
      front14: '.controlWindow.circle.front.onefour',
      ch1_text: '.controlWindow.value.one',
      ch2_text: '.controlWindow.value.two',
      ch3_text: '.controlWindow.value.three',
      ch4_text: '.controlWindow.value.four',
      autoPilot_btn: '.controlWindow.auto-pilot',
    },

    events: {
    },

    initialize: function () {
      this.throttle = 0;
      this.roll = 0;
      this.pitch = 0;
      this.yaw_rudder = 0;
      this.auto_ON_OFF = true;
      this.control_off = false;
      this.type = PicPilot_Conf.get('type');
      
      this.aircraft_channel_callback = this.aircraftChannelCallback.bind(this);
      TelemetryData.addListener('aircraft_channels', this.aircraft_channel_callback);
    },
    
    aircraftChannelCallback: function(data){
      var ch1 = data[Channel_Conf.get(this.type)['throttle']];
      var ch2 = data[Channel_Conf.get(this.type)['roll']];
      var ch3 = data[Channel_Conf.get(this.type)['pitch']];
      var ch4 = data[Channel_Conf.get(this.type)['rudder_yaw']];
      var ch5 = data[Channel_Conf.get(this.type)['autopilot_ON_OFF']];
      // if RC controller is OFF
      if(ch1 < -1024 || ch2 < -1024 || ch3 < -1024 || ch4 < -1024 || ch5 < -1024 || ch1 > 1024 || ch2 > 1024 || ch3 > 1024 || ch4 > 1024 || ch5 > 1024){
        this.control_off = true;
        this.ui.front14.css({"margin-left": "43%","margin-top":"43%",
                               "background-color": "rgba(244,122,122,1)",
                               "border-color": "rgba(244,122,122,1"});
        this.ui.front23.css({"margin-left": "43%","margin-top":"43%",
                               "background-color": "rgba(244,122,122,1)",
                               "border-color": "rgba(244,122,122,1"});
      }else{
        this.ui.front23.css("background-color", "rgba(32,32,32,1)");
        this.ui.front14.css("background_color", "rgba(32,32,32,1)");
        this.control_off = false;
      }
      this.setThrottle(ch1);
      this.setRoll(ch2);
      this.setPitch(ch3);
      this.setYawRudder(ch4);
      this.setOnOff(ch5);
    },
    
    onRender: function(){
    },
    
    setThrottle(val){
      if(val != null){
        if(this.control_off){
          this.ui.ch1_text.text("");
        }else{
          this.throttle = val;
          var percentage = 43 - val/1024 * 43;
          this.ui.front14.css("margin-top", percentage.toString()+"%");
          this.ui.ch1_text.text(val.toString()+',');
        }
      }
    },
    
    setRoll(val){
      if(val != null){
        if(this.control_off){
          this.ui.ch2_text.text("");
        }else{
          this.roll = val;
          var percentage = val/1024 * 43 + 43;
          this.ui.front23.css("margin-left", percentage.toString() + "%");
          this.ui.ch2_text.text(val.toString()+',');
        }
      }
    },
    
    setPitch(val){
      if(val != null){
        if(this.control_off){
          this.ui.ch3_text.text("RC Controller is OFF");
        }else{
          this.pitch = val;
          var percentage = 43 - val/1024 * 43;
          this.ui.front23.css("margin-top", percentage.toString() +"%");
          this.ui.ch3_text.text(val.toString());
        }
      }
    },
    
    setYawRudder(val){
      if(val != null){
        if(this.control_off){
          this.ui.ch4_text.text("RC Controller is OFF");
        }else{
          var percentage = val/1024 * 43 + 43;
          this.yaw_rudder = val;
          this.ui.front14.css("margin-left", percentage.toString() + "%");
          this.ui.ch4_text.text(val.toString());
        }
          
      }
    },
    
    setOnOff(val){
      if(val != null){
        if(val > 0){
          console.log("ONOFF:",val);
          this.auto_ON_OFF = true;
          this.ui.autoPilot_btn.css("background-color","rgba(122,244,122,1)");
          this.ui.autoPilot_btn.css("border-color","rgba(122,244,122,1)");
        }else{
          this.auto_ON_OFF = false;
          this.ui.autoPilot_btn.css("background-color","rgba(244,122,122,1)");
          this.ui.autoPilot_btn.css("border-color","rgba(244,122,122,1)");
        }
      }
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
      TelemetryData.removeListener('aircraft_channels', this.aircraft_channel_callback);
    },
  });
};