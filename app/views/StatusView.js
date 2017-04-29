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

  return Marionette.ItemView.extend({
    template: Template('StatusView'), //name of the file in the views folder at the project root
    className: 'statusView',

    ui: {
      statuses: ".statuses",
      utc_time: "#utc-time",
      system_time: "#system-time",
      motor_battery_percent: "#motor-battery .battery-percentage",
      motor_battery_message: "#motor-battery .battery-message",
      motor_battery_picture: "#motor-battery .battery-picture .battery-base .percentage",
      internal_battery_percent: "#internal-battery .battery-percentage",
      internal_battery_message: "#internal-battery .battery-message",
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
    },
    onRender: function () {
      this.transmissionInterval = setInterval(function () {
        this.ui.transmission_speed.text(this.messagesReceived + '/s');
        this.messagesReceived = 0;
      }.bind(this), 1000);
    },

    telemetryStatusCallback: function(data){
      if (data.internal_battery_voltage != null){
        this.setInternalBatteryLevel(data.internal_battery_voltage);
      }

      if (data.external_battery_voltage != null){
        this.setMotorBatteryLevel(data.external_battery_voltage);
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
    },

    setInternalBatteryLevel: function (battery_level) {
      if (battery_level !== null && battery_level !== this.current_internal_battery_level) {
        var volts = Math.round(battery_level/100); //just do a straight division for now
        var percent =  (volts/picpilot_config.get('motor_battery_cell_count') - 3.5)/(1/(4.2-3.5));
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
};3.