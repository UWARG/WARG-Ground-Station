/**
 * @author Serge Babayan
 * @module views/StatusView
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
var StatusManager = remote.require('./app/StatusManager');
var Logger = remote.require('./app/util/Logger');
var Validator = require('../util/Validator');
var Template = require('../util/Template');
var picpilot_config = require('../../config/picpilot-config');
var moment = require('moment');


module.exports = function (Marionette, $) {

  var BatteryPercentView = require('./BatteryPercentView')(Marionette, $);
  return Marionette.LayoutView.extend({
    template: Template('StatusView'), //name of the file in the views folder at the project root
    className: 'statusView',

    regions:
    {
      Battery: "#battery-percent-region"
    },

    ui: {
      statuses: ".statuses",
      utc_time: "#utc-time",
      system_time: "#system-time",
      motor_battery_percent: "#motor-battery .battery-percentage",
      //add motor_battery_accutate_percent
      //motor_battery_accurate_percent: "#motor-battery-percentage .battery-percentage-view",
      //add motor_battery_accurate_message
      //motor_battery_accurate_message: "#motor-battery-percentage .battery-message",
      motor_battery_message: "#motor-battery .battery-message",
      //add motor_battery_accurate_picture
      //motor_battery_accurate_picture: "#motor-battery-percentage .battery-picture .battery-base .percentage",
      motor_battery_picture: "#motor-battery .battery-picture .battery-base .percentage",
      internal_battery_percent: "#internal-battery .battery-percentage",
      //add internal_battery_accurate_percent
      //internal_battery_accurate_percent: "#internal-battery-percentage .battery-percentage-view",
      //add internal_battery_accurate_message
      //internal_battery_accurate_message: "#internal-battery-percentage .battery-message",
      internal_battery_message: "#internal-battery .battery-message",
      //add internal _battery_accurate_picture
      //internal_battery_accurate_picture: "#internal-battery-percentage .battery-picture .battery-base .percentage",
      internal_battery_picture: "#internal-battery .battery-picture .battery-base .percentage",
      gps_message: ".gps-status .gps-message",
      transmission_speed: '#transition-rate',
      dl_rssi: '#dl-rssi',
      ul_rssi: '#ul-rssi',
      uhf_rssi: '#uhf-rssi',
      uhf_link_quality: '#uhf-link-quality',
      transmission_errors: '#transmission-errors',
      receive_errors: '#receive-errors'
    },

    initialize: function () {
      this.starting_time = null;
      this.current_internal_battery_level = -1;
      this.current_motor_battery_level = -1;
      this.current_gps_status = null;
      this.messagesReceived = 0;//for keeping track of the transmission rate
      this.transmissionInterval = null;
      this.telemetry_status_callback = this.telemetryStatusCallback.bind(this); //so that we can get rid of the listener safely
      this.telemetry_position_callback = this.telemetryPositionCallback.bind(this);
      this.telemetry_radio_callback = this.telemetryRadioCallback.bind(this);
      this.new_status_callback = this.onNewStatusCallback.bind(this);
      this.remove_status_callback = this.onRemoveStatusCallback.bind(this);
      this.status_messages = [];

      TelemetryData.addListener('aircraft_status', this.telemetry_status_callback);
      TelemetryData.addListener('aircraft_position', this.telemetry_position_callback);
      TelemetryData.addListener('radio_status', this.telemetry_radio_callback);
      StatusManager.addListener('new_status', this.new_status_callback);
      StatusManager.addListener('remove_status', this.remove_status_callback);
      this.internal_battery_view = new BatteryPercentView();
    },
    onRender: function () {
      this.transmissionInterval = setInterval(function () {
        this.ui.transmission_speed.text(this.messagesReceived + '/s');
        this.messagesReceived = 0;
      }.bind(this), 1000);
      this.getRegion('Battery').show(this.internal_battery_view);

    },

    telemetryStatusCallback: function(data){
      //console.log(data.external_battery_voltage);
      if (data.internal_battery_voltage != null){
        this.internal_battery_view.setVoltage(data.internal_batter_voltage);
        this.setInternalBatteryLevel(data.internal_battery_voltage);
        //this.setInternalBatteryPercentage(data.internal_battery_voltage);
      }

      if (data.external_battery_voltage != null){
        this.setMotorBatteryLevel(data.external_battery_voltage);
      //  this.setMotorBatteryPercentage(data.external_battery_voltage);
      }
      // this.setGpsLevel(data.gps_status);
    },

    telemetryPositionCallback: function(data){
      if (data.gps_time !== null) {
        var time = data.gps_time.toFixed(2);
        this.starting_time = moment(time, 'HHmmss.SS');
        this.ui.utc_time.text(time);
      }

      if (data.sys_time !== null) {
        this.ui.system_time.text(data.sys_time);
      }

      this.messagesReceived++;
    },

    telemetryRadioCallback: function(data){
      if (data.dl_rssi != null){
        this.ui.dl_rssi.text(data.dl_rssi);
      }

      if (data.ul_rssi != null){
        this.ui.ul_rssi.text(data.ul_rssi);
      }

      if (data.uhf_rssi != null){
        this.ui.uhf_rssi.text(data.uhf_rssi);
      }

      if (data.uhf_link_quality != null){
        this.ui.uhf_link_quality.text(data.uhf_link_quality);
      }

      if (data.dl_transmission_errors != null){
        this.ui.transmission_errors.text(data.dl_transmission_errors);
      }

      if (data.ul_receive_errors != null){
        this.ui.receive_errors.text(data.ul_receive_errors);
      }
    },

    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_status', this.telemetry_status_callback);
      TelemetryData.removeListener('aircraft_position', this.telemetry_position_callback);
      TelemetryData.removeListener('radio_status', this.telemetry_radio_callback);
      StatusManager.removeListener('new_status', this.new_status_callback);
      StatusManager.removeListener('remove_status', this.remove_status_callback);
      clearInterval(this.transmissionInterval);
    },

    onNewStatusCallback: function (message, priority, timeout) {
      if (priority === 0) {
        var element = $('<p class="status status-high red">' + message + '</p>');
      }
      else if (priority === 1) {
        var element = $('<p class="status status-high green">' + message + '</p>');
      }
      else if (priority === 2) {
        var element = $('<p class="status status-medium">' + message + '</p>');
      }
      else {
        var element = $('<p class="status status-low">' + message + '</p>');
      }
      this.status_messages.push({
        element: element,
        message: message,
        priority: priority,
        timeout: timeout
      });
      this.ui.statuses.append(element);
      this.ui.statuses[0].scrollTop = 0;
    },

    onRemoveStatusCallback: function (message, priority, timeout) {
      for (var i = 0; i < this.status_messages.length; i++) {
        if (this.status_messages[i].message === message && this.status_messages[i].priority === priority && this.status_messages[i].timeout === timeout) {
          this.status_messages[i].element.remove();
          this.status_messages.splice(i, 1);
          return;
        }
      }
    }, /*
    //add setInternalBatteryPercentage
    setInternalBatteryPercentage: function (battery_level){
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
*/
    setInternalBatteryLevel: function (battery_level) {
      //console.log(1);
      if (battery_level !== null && battery_level !== this.current_internal_battery_level) {
        var volts = Math.round(battery_level/100); //just do a straight division for now
        var percent =  (volts/picpilot_config.get('motor_battery_cell_count') - 3.5)/(1/(4.2-3.5));
        //console.log(volts);
        //console.log(percent);
        //console.log(battery_level);
        if (volts == 0){
          percent = 0;
        }
        this.current_internal_battery_level = percent;
        this.ui.internal_battery_percent.text(percent.toFixed(2) + '%');
        this.ui.internal_battery_picture.css('width', percent + '%');
        if (percent > 50 && percent <= 100) {
          this.ui.internal_battery_picture.css('background-color', 'green');
          this.ui.internal_battery_message.text('');
        } else if (percent >= 20 && percent <= 50) {
          this.ui.internal_battery_picture.css('background-color', 'orange');
          this.ui.internal_battery_message.text('Low');
          this.ui.internal_battery_message.css('color', 'orange');
        } else {
          this.ui.internal_battery_picture.css('background-color', 'red');
          this.ui.internal_battery_message.text('Very Low');
          this.ui.internal_battery_message.css('color', 'red');
        }
      }
    },
/*
    setMotorBatteryPercentage: function (battery_level){
      if(battery_level !== null && battery_level !== this.current_motor_battery_level){
        var motor_battery_num = picpilot_config.get('motor_battery_cell_count');
        var voltage = battery_level * 0.0035;
        var percent;
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
*/
    setMotorBatteryLevel: function(battery_level){
        var volts = Math.round(battery_level/100); //just do a straight division for now
        var percent =  (volts/picpilot_config.get('motor_battery_cell_count') - 3.5)/(1/(4.2-3.5));
        if (volts == 0){
          percent = 0;
        }
        this.current_motor_battery_level = percent;
        this.ui.motor_battery_percent.text(percent.toFixed(2) + '%');
        this.ui.motor_battery_picture.css('width', percent + '%');
        if (percent > 50 && percent <= 100) {
          this.ui.motor_battery_picture.css('background-color', 'green');
          this.ui.motor_battery_message.text('');
        } else if (percent >= 20 && percent <= 50) {
          this.ui.motor_battery_picture.css('background-color', 'orange');
          this.ui.motor_battery_message.text('Low');
          this.ui.motor_battery_message.css('color', 'orange');
        } else {
          this.ui.motor_battery_picture.css('background-color', 'red');
          this.ui.motor_battery_message.text('Very Low');
          this.ui.motor_battery_message.css('color', 'red');
        }
    },

    setGpsLevel: function (gps_level) {
      if(gps_level !== null) {
        if (gps_level !== this.current_gps_status) { //check if the gps status is different than last time
          this.current_gps_status = gps_level;

          if (gps_level === 0) {
            Logger.warn('no GPS connection');
            this.ui.gps_message.css('color', 'red');
            this.ui.gps_message.text('NOT CONNECTED');
          }
          else {
            this.ui.gps_message.css('color', 'green');
            this.ui.gps_message.text('Connected to ' + (gps_level & 0x0f) + ' satelites');
          }
        }
      }
    }
  });
};
