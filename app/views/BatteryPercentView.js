/**
 * @author Rosa Chen
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
      //add motor_battery_accutate_percent
      motor_battery_accurate_percent: "#motor-battery-percentage .battery-percentage-view",
      //add motor_battery_accurate_message
      motor_battery_accurate_message: "#motor-battery-percentage .battery-message",
      //add motor_battery_accurate_picture
      motor_battery_accurate_picture: "#motor-battery-percentage .battery-picture .battery-base .percentage",
      //add internal_battery_accurate_percent
      internal_battery_accurate_percent: "#internal-battery-percentage .battery-percentage-view",
      //add internal_battery_accurate_message
      internal_battery_accurate_message: "#internal-battery-percentage .battery-message",
      //add internal _battery_accurate_picture
      internal_battery_accurate_picture: "#internal-battery-percentage .battery-picture .battery-base .percentage"
    },

    initialize: function(){
      this.current_internal_battery_level = -1;
      this.current_motor_battery_level = -1;

      this.telemetry_status_callback = null;
    },

    onRender: function(){
      this.telemetry_status_callback = this.telemetryStatusCallback.bind(this); //so that we can get rid of the listener safely
      TelemetryData.addListener('aircraft_status', this.telemetry_status_callback);
    },

    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_status', this.telemetry_status_callback);
    },

    telemetryStatusCallback: function(data){
      if (data.internal_battery_voltage != null){
        this.setInternalBatteryPercentage(data.internal_battery_voltage);
      }

      if (data.external_battery_voltage != null){
        this.setMotorBatteryPercentage(data.external_battery_voltage);
      }
    },

    //add setInternalBatteryPercentage
    setInternalBatteryPercentage: function (battery_level){
      console.log(1);
      if (battery_level !== null && battery_level !== this.current_internal_battery_level) {
        var internal_battery_num = picpilot_config.get('internal_battery_cell_count');
        var voltage = battery_level * 0.0035;
        var percent;
        switch (internal_battery_num){
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

        this.ui.internal_battery_accurate_percent.text(percent.toFixed(2) + '%');
        this.ui.internal_battery_accurate_picture.css('width', percent + '%');

        if (percent > 50 && percent <= 100) {
          this.ui.internal_battery_accurate_picture.css('background-color', 'green');
          this.ui.internal_battery_accurate_message.text('');
        } else if (percent >= 20 && percent <= 50) {
          this.ui.internal_battery_accurate_picture.css('background-color', 'orange');
          this.ui.internal_battery_accurate_message.text('Low');
          this.ui.internal_battery_accurate_message.css('color', 'orange');
        } else {
          this.ui.internal_battery_accurate_picture.css('background-color', 'red');
          this.ui.internal_battery_accurate_message.text('Very Low');
          this.ui.internal_battery_accurate_message.css('color', 'red');
        }
      }
    },

    setMotorBatteryPercentage: function (battery_level){
      //console.log(1);
      if(battery_level !== null && battery_level !== this.current_motor_battery_level){
        var motor_battery_num = picpilot_config.get('motor_battery_cell_count');
        var voltage = battery_level * 0.0035;
        var percent;
        //console.log(battery_level);
        //console.log(motor_battery_num);
        //console.log(voltage);
        //console.log(percent);
        switch (motor_battery_num){
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

        if (percent < 0){
          percent = 0;
        }
        else if (percent > 100){
          percent = 100;
        }

        if (percent > 50 && percent <= 100) {
          this.ui.motor_battery_accurate_picture.css('background-color', 'green');
          this.ui.motor_battery_accurate_message.text('');
        } else if (percent >= 20 && percent <= 50) {
          this.ui.motor_battery_accurate_picture.css('background-color', 'orange');
          this.ui.motor_battery_accurate_message.text('Low');
          this.ui.motor_battery_accurate_message.css('color', 'orange');
        } else {
          this.ui.motor_battery_accurate_picture.css('background-color', 'red');
          this.ui.motor_battery_accurate_message.text('Very Low');
          this.ui.motor_battery_accurate_message.css('color', 'red');
        }
        this.ui.motor_battery_accurate_percent.text(percent.toFixed(2) + '%');
      }

    },
  });
};
