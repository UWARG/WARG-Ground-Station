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
	
    events: {
      'click #keep_last_valid_packet': 'toggleKeepLastPacket'
    },

    initialize: function () {
      this.telemetryCallbacks = {};
      this.last_received_date = null;
      this.telemetry_data = {};
      this.keep_last_packet = false;

      _.each(PacketTypes, function (headers, packet_name) {
        this.telemetryCallbacks[packet_name] = this.dataCallback.bind(this, packet_name);
        TelemetryData.on(packet_name, this.telemetryCallbacks[packet_name]);
      }.bind(this));
    },

    serializeData: function () {
      return {
        last_received_date: this.last_received_date ? this.last_received_date.toString() : 'No data received yet.',
        telemetry_data: this.telemetry_data
      }
    },

    dataCallback: function (packet_name, data) {
      //whether we should overwrite the existing data even if we receive null
      if (this.keep_last_packet){
        _.each(this.telemetry_data[packet_name], function(value, header){
          if (data[header] !== null){
            this.telemetry_data[packet_name][header] = data[header];
          }
        }.bind(this));
      } else {
        this.telemetry_data[packet_name] = data;
      }
      this.last_received_date = new Date();
      this.render();
    },
	
    toggleKeepLastPacket: function(){
      this.keep_last_packet = !this.keep_last_packet;
    },
	
    onBeforeDestroy: function () {
      _.each(PacketTypes, function (headers, packet_name) {
        TelemetryData.removeListener(packet_name, this.telemetryCallbacks[packet_name]);
      }.bind(this));
    }
  });
};