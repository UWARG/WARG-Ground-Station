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

var moment = require('moment');

module.exports = function (Marionette, $) {

  return Marionette.ItemView.extend({
    template: Template('StatusView'), //name of the file in the views folder at the project root
    className: 'statusView',

    ui: {
      statuses: ".statuses",
      vehicle_time: ".time-view .vehicle-time",
      elapsed_time: ".time-view .elapsed-time",
      battery_percent: ".battery-percentage",
      battery_message: ".battery-message",
      battery_picture: ".battery-picture .battery-base .percentage",
      gps_message: ".gps-status .gps-message",
      transmission_speed: '.transition-rate',
      rssi: '.rssi'
    },
    events: {
      'click #reset-elapsed-time': 'resetElapsedTime',
      'click #clear-statuses-button': 'clearStatuses'
    },

    initialize: function () {
      this.starting_time = null;
      this.current_battery_level = -1;
      this.current_gps_status = null;
      this.messagesReceived = 0;//for keeping track of the transmission rate
      this.transmissionInterval = null;
      this.telemetry_status_callback = this.telemetryStatusCallback.bind(this); //so that we can get rid of the listener safely
      this.new_status_callback = this.onNewStatusCallback.bind(this);
      this.remove_status_callback = this.onRemoveStatusCallback.bind(this);
      this.status_messages = [];

      TelemetryData.addListener('aircraft_status', this.telemetry_status_callback);
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
      if (data.time !== null) {
        time = data.time.toFixed(2);
        this.starting_time = moment(time, 'HHmmss.SS');
      }
      this.setTime(data.time);
      this.setBatteryLevel(data.battery_level1);
      this.setGpsLevel(data.gps_status);
      this.ui.rssi.text(data.RSSI);
      this.messagesReceived++;
    },

    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_status', this.telemetry_status_callback);
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
    setTime: function (time) {
      if(time !== null){
        time = Number(time).toFixed(2);
        var date = moment(time, 'HHmmss.SS');
        var elapsed_time = moment(date.diff(this.starting_time));
        this.ui.vehicle_time.text(date.format('HH:mm:ss:SS'));
        this.ui.elapsed_time.text(elapsed_time.minute() + ' min ' + elapsed_time.second() + ' sec');
      }
    },
    setBatteryLevel: function (battery_level) {
      if (battery_level !== null && battery_level !== this.current_battery_level) {
        var percent = Math.round(battery_level);
        this.current_battery_level = percent;
        this.ui.battery_percent.text(percent + '%');
        this.ui.battery_picture.css('width', percent + '%');
        if (percent > 50 && percent <= 100) {
          this.ui.battery_picture.css('background-color', 'green');
          this.ui.battery_message.text('');
        } else if (percent >= 20 && percent <= 50) {
          this.ui.battery_picture.css('background-color', 'orange');
          this.ui.battery_message.text('Low');
          this.ui.battery_message.css('color', 'orange');
        } else {
          this.ui.battery_picture.css('background-color', 'red');
          this.ui.battery_message.text('Very Low');
          this.ui.battery_message.css('color', 'red');
        }
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
    },
    resetElapsedTime: function () {
      this.starting_time = null;
    },
    clearStatuses: function () { //removes all persistent statuses
      StatusManager.removeStatusesByTimeout(0);
    }

  });
};