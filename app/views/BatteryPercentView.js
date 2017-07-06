/**
 * @author Serge Babayan & Rosa Chen
 * @module views/BatteryPercentView
 * @requires StatusManager
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires util/Logger
 * @requires util/Validator
 * @requires electron
 * @requires moment
 * @listens models/TelemetryData~TelemetryData:data_received
 * @listens models/StatusManager~StatusManager:new_status
 * @listens models/StatusManager~StatusManager:remote_status
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description View for the status bar that listens in on events from StatusManager and TelemetryData
*/
var remote = require('electron').remote;
var TelemetryData = remote.require('./app/models/TelemetryData');
var Logger = remote.require('./app/util/Logger');
var Validator = require('../util/Validator');
var Template = require('../util/Template');
var picpilot_config = require('../../config/picpilot-config');

module.exports = function (Marionette, $) {


  return Marionette.ItemView.extend({
    template: Template('BatteryPercentView'), //name of the file in the views folder at the project root
    className: 'batteryPercentView',

    ui:{
      battery_accurate_percent: ".battery-percentage-view",
      battery_accurate_message: ".battery-message",
      battery_accurate_picture: ".battery-picture .battery-base .percentage",
    },

    initialize: function(){
      this.current_internal_battery_level = -1;
      this.current_motor_battery_level = -1;

      this.telemetry_status_callback = null;
    },

    telemetryStatusCallback: function(data){
      if (data.internal_battery_voltage != null){
        this.setBatteryPercentage(data.internal_battery_voltage, picpilot_config.get('internal_battery_cell_count'));
      }

      if (data.external_battery_voltage != null){
        this.setBatteryPercentage(data.external_battery_voltage, picpilot_config.get('motor_battery_cell_count'));
      }
    },

    setBatteryPercentage: function (battery_level, battery_num) {
      if (battery_level !== null && battery_level !== this.current_internal_battery_level && battery_level !== this.current_motor_battery_level) {
        var voltage = battery_level * 0.0035;
        var percent;
        switch (battery_num){
          case 1:
            percent= 122.49*Math.pow(voltage,2)-788.56*voltage+1265.5;
            break;
          case 2:
            percent= 30.708*Math.pow(voltage,2)-395.56*voltage+1270.2;
            break;
          case 3:
            percent= 13.648*Math.pow(voltage,2)-263.71*voltage+1270.2;
            break;
          case 4:
            percent= 7.6771*Math.pow(voltage,2)-197.78*voltage+1270.2;
            break;
          case 5:
            percent= 4.9133*Math.pow(voltage,2)-158.23*voltage+1270.2;
            break;
          case 6:
            percent= 3.4025*Math.pow(voltage,2)-131.43*voltage+1265.5;
            break;
          default:
            percent= 0;
        }

        //check the percent less than 0 or more than 100
        if (percent < 0){
          percent = 0;
        }
        else if (percent > 100){
          percent = 100;
        }

        this.ui.battery_accurate_percent.text(percent.toFixed(2) + '%');
        this.ui.battery_accurate_picture.css('width', percent + '%');

        if (percent > 50 && percent <= 100) {
          this.ui.battery_accurate_picture.css('background-color', 'green');
          this.ui.battery_accurate_message.text('');
        } else if (percent >= 20 && percent <= 50) {
          this.ui.battery_accurate_picture.css('background-color', 'orange');
          this.ui.battery_accurate_message.text('Low');
          this.ui.battery_accurate_message.css('color', 'orange');
        } else {
          this.ui.battery_accurate_picture.css('background-color', 'red');
          this.ui.battery_accurate_message.text('Very Low');
          this.ui.battery_accurate_message.css('color', 'red');
        }
      }
    },
  });
};
