/**
 * @author Serge Babayan
 * @module views/DataView
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Displays the current data packet in the TelemetryData module in a nice form
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var PacketTypes = require('../models/PacketTypes');
var _ = require('underscore');

module.exports = function (Marionette, Backbone) {
  return Marionette.ItemView.extend({
    template: Template('DataView'), //name of the file in the views folder at the project root
    className: 'dataView', //this is the class name the injected div will have (refer to this class in your style sheets)

    ui:{
      'view_raw_data_checkbox': '#view-raw-data'
    },

    events: {
      'change #view-raw-data': 'toggleViewRawData',
      'change #keep-state-history': 'toggleKeepStateHistory'
    },

    initialize: function () {
      this.view_raw_data = false;
      this.keep_state_history = false;
      this.telemetry_callbacks = {};
      this.last_received_date = null;
      this.telemetry_data = {};
      this.raw_telemetry_data = {};

      _.each(PacketTypes, function (headers, packet_name) {
        this.telemetry_callbacks[packet_name] = this.dataCallback.bind(this, packet_name);
        TelemetryData.on(packet_name, this.telemetry_callbacks[packet_name]);
      }.bind(this));
    },

    serializeData: function () {
      return {
        last_received_date: this.last_received_date ? this.last_received_date.toString() : 'No data received yet.',
        telemetry_data: this.telemetry_data,
        raw_telemetry_data: this.raw_telemetry_data,
        keep_state_history: this.keep_state_history,
        view_raw_data: this.view_raw_data
      }
    },

    dataCallback: function (packet_name, data) {
      _.each(TelemetryData.getHeaders(), function(header, index){
        if(!this.keep_state_history){
          this.raw_telemetry_data[header] = TelemetryData.getLatestDataReceivedFromHistory()[index];
        } else if(TelemetryData.getLatestDataReceivedFromHistory()[index] !== ''){
          this.raw_telemetry_data[header] = TelemetryData.getLatestDataReceivedFromHistory()[index];
        }
      }.bind(this));
      this.telemetry_data[packet_name] = data;
      this.last_received_date = new Date();
      this.render();
    },

    onBeforeDestroy: function () {
      _.each(PacketTypes, function (headers, packet_name) {
        TelemetryData.removeListener(packet_name, this.telemetry_callbacks[packet_name]);
      }.bind(this));
    },

    toggleViewRawData: function(e){
      this.view_raw_data = !this.view_raw_data;
    },

    toggleKeepStateHistory: function(e){
      this.keep_state_history = !this.keep_state_history;
    }
  });
};