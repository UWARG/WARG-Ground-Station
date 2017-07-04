/**
 * @author Bingzheng Feng
 * @module views/ControllerInputsView
 * @requires models/Commands
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires config/vehicle-channel-config
 * @requires config/picpilot-config
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for displaying all the received controller inputs
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Commands = remote.require('./app/models/Commands');
var channel_config = remote.require('./config/vehicle-config');
var picpilot_conf = remote.require('./config/picpilot-config');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend( {
    template: Template('ControllerInputsView'),
    className: 'controllerInputsView',

    ui: {
      front23: '.twothree .circle',
      front14: '.onefour .circle',
      ch1_text: '.one',
      ch2_text: '.two',
      ch3_text: '.three',
      ch4_text: '.four',
      auto_pilot_btn: '#auto-pilot',
    },

    initialize: function () {
      this.throttle = 0;
      this.roll = 0;
      this.pitch = 0;
      this.yaw_rudder = 0;
      this.autopilot_is_on= true;
      this.control_off = false;
      this.is_scaled = true;
      this.type = picpilot_conf.get('vehicle_type');
    },
    
    rcIsOff: function(ch1, ch2, ch3, ch4, ch5) {
      return (ch1 == -10000 || ch2 == -10000 || ch3 == -10000 || ch4 == -10000 || ch5 == -10000);
    },
    
    aircraftChannelCallback: function(data) {
      var current_vehicle = channel_config.get(this.type);
      var ch1 = data[current_vehicle['throttle']];
      var ch2 = data[current_vehicle['roll']];
      var ch3 = data[current_vehicle['pitch']];
      var ch4 = data[current_vehicle['rudder_yaw']];
      var ch5 = data[current_vehicle['autopilot_on_off']];
      this.is_scaled = data['channels_scaled'];
      // if RC controller is OFF
      if(this.rcIsOff(ch1, ch2, ch3, ch4, ch5)) {
        this.control_off = true;
        this.ui.front14.css({"margin-left": "43%","margin-top":"43%",
                               "background-color": "rgba(244,122,122,1)",
                               "border-color": "rgba(244,122,122,1"});
        this.ui.front23.css({"margin-left": "43%","margin-top":"43%",
                               "background-color": "rgba(244,122,122,1)",
                               "border-color": "rgba(244,122,122,1"});
      } else {
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
    
    onRender: function() {
      this.aircraft_channel_callback = this.aircraftChannelCallback.bind(this);
      TelemetryData.addListener('aircraft_channels', this.aircraft_channel_callback);
    },
    
    setThrottle(val) {
      if(val != null) {
        if(this.control_off) {
          this.ui.ch1_text.text("");
        } else {
          if(this.is_scaled) {
            this.throttle = val;
            var percentage = 43 - val/1024 * 43;
            this.ui.front14.css("margin-top", percentage.toString()+"%");
          }
          this.ui.ch1_text.text(val.toString()+',');
        }
      }
    },
    
    setRoll(val) {
      if(val != null) {
        if(this.control_off) {
          this.ui.ch2_text.text("");
        } else {
          if(this.is_scaled) {
            this.roll = val;
            var percentage = val/1024 * 43 + 43;
            this.ui.front23.css("margin-left", percentage.toString() + "%");
          }
          this.ui.ch2_text.text(val.toString()+',');
        }
      }
    },
    
    setPitch(val) {
      if(val != null) {
        if(this.control_off) {
          this.ui.ch3_text.text("RC Controller is OFF");
        } else {
          if(this.is_scaled) {
            this.pitch = val;
            var percentage = 43 - val/1024 * 43;
            this.ui.front23.css("margin-top", percentage.toString() +"%");
          }
          this.ui.ch3_text.text(val.toString());
        }
      }
    },
    
    setYawRudder(val) {
      if(val != null) {
        if(this.control_off) {
          this.ui.ch4_text.text("RC Controller is OFF");
        } else {
          if(this.is_scaled) {
            var percentage = val/1024 * 43 + 43;
            this.yaw_rudder = val;
            this.ui.front14.css("margin-left", percentage.toString() + "%");
          }
          this.ui.ch4_text.text(val.toString());
        }
          
      }
    },
    
    setOnOff(val) {
      if(val != null) {
        if(val > 0) {
          this.autopilot_is_on = true;
          this.ui.auto_pilot_btn.className = "pure-button button-success";
          this.ui.auto_pilot_btn.text("Auto Pilot On");
        } else {
          this.autopilot_is_on = false;
          this.ui.auto_pilot_btn.className = "pure-button button-error";
          this.ui.auto_pilot_btn.text("Auto Pilot On");
        }
      }
    },
    onBeforeDestroy: function() {
      TelemetryData.removeListener('aircraft_channels', this.aircraft_channel_callback);
    },
  });
};