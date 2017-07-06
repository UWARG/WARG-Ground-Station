/**
 * @author Serge Babayan & Rosa Chen
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
      InternalBattery: "#internal-battery-percent-region",
      ExternalBattery: "#external-battery-percent-region"
    },

    ui: {
      statuses: ".statuses",
      utc_time: "#utc-time",
      system_time: "#system-time",
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
      this.external_battery_view = new BatteryPercentView();
    },
    onRender: function () {
      this.transmissionInterval = setInterval(function () {
        this.ui.transmission_speed.text(this.messagesReceived + '/s');
        this.messagesReceived = 0;
      }.bind(this), 1000);
      this.getRegion('InternalBattery').show(this.internal_battery_view);
      this.getRegion('ExternalBattery').show(this.external_battery_view);
    },

    telemetryStatusCallback: function(data){
      //console.log(data.external_battery_voltage);
      if (data.internal_battery_voltage != null){
        this.internal_battery_view.setBatteryPercentage(data.internal_battery_voltage, picpilot_config.get('internal_battery_cell_count'));
      }

      if (data.external_battery_voltage != null){
        this.external_battery_view.setBatteryPercentage(data.external_battery_voltage, picpilot_config.get('motor_battery_cell_count'));
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
