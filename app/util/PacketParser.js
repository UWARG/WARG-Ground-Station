/**
 * @author Serge Babayan
 * @module util/PacketParser
 * @requires util/Logger
 * @requires util/Validator
 * @requires models/PacketTypes
 * @requires underscore
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Parses data received from the data relay into a usable format for the ground station's event emitters
 * @see http://docs.uwarg.com/picpilot/datalink/
 */

var PacketTypes = require('../models/PacketTypes');
var Logger = require('./Logger');
var Validator = require('./Validator');
var _ = require('underscore');

var PacketParser = {
  /**
   * Compares the received headers to that of the headers in the PacketTypes module.
   * Warns the user if there are extra or missing headers
   * @function checkForMissingHeaders
   * @param {Array} headers_array
   */
  checkForMissingHeaders: function (headers_array) {
    var expected_headers = {};

    //create a list of the headers we expect to receive and set their value to 0
    _.each(PacketTypes, function (packet_headers) {
      _.each(packet_headers, function (validator, header_name) {
        expected_headers[header_name] = 0;
      })
    });

    _.each(headers_array, function (header_name) {
      //if we receive a header that wasn't listed in the PacketTypes model
      if (expected_headers[header_name] === undefined) {
        Logger.warn('An unexpected header was received from the data relay. Header: ' + header_name);
      }
      else {
        expected_headers[header_name]++;
      }
    });

    _.each(expected_headers, function (count, header_name) {
      if (count === 0) {
        Logger.warn('Did not receive an expected header! Header: ' + header_name);
      }
      else if (count > 1) {
        Logger.warn('Header: ' + header_name + ' was received more than once! Times: ' + count);
      }
    });
  },
  
  /**
   * Converts a string of data into a packet type object, to be emitted by the TelemetryData module.
   * Uses the PacketTypes module in order to sort the headers into the appropriate packet types as well
   * as to perform the correct validations on each one
   * @function parseData
   * @param data {string} A stringified version of the data (split by commas)
   * @param headers_array {Array} An array of the headers in the same order as the headers
   * @returns {Object} A hash indexed by the packet type name, with the values being another hash in a format of header_name => data_value
   * @throws Error if the specified validation function doesn't exist
   * @example <caption> Given <code>'34, 89.654, ...'</code> as data and <code>['heading', 'lon', ...]</code> as headers, will return: </caption>
   * {
   *    aircraft_position: {
   *      heading: 34,
   *      lon: 89.654
   *      ...
   *    },
   *    aircraft_orientation: {...},
   *    aircraft_gains: {...}
   *    ...
   * }
   */
  parseData: function (data, headers_array) {
    if(!data || !headers_array){
      return {};
    }

    var data_array = data.split(",");
    var sorted_data = {};
    var current_state = {};

    //warn the user if we receive an improper number of data
    if (data_array.length !== headers_array.length) {
      Logger.error('Number of data headers doesn\'t match the number of data! Length of data: ' + data_array.length + ' Length of headers: ' + headers_array.length);
    }

    //creates a current_state object, which is a hash with the keys being the header name, and the value being the data for that header
    for (var i = 0; i < headers_array.length; i++) {
      current_state[headers_array[i]] = data_array[i];
    }

    _.each(PacketTypes, function (packet_headers, packet_type_name) {
      var packet_data = {};

      _.each(packet_headers, function (validators, header_name) {
        //if it is null, that means the data relay intentionally didn't send us the data
        if (current_state[header_name] === '' || current_state[header_name] === ' ') {
          packet_data[header_name] = null;
        }
        //warn the user if we didn't receive a piece of data (happens if we don't receive enough data)
        else if (current_state[header_name] === undefined) {
          Logger.error('Parsing Error. Value for header ' + header_name + ' not received');
          packet_data[header_name] = null;
        }
        //otherwise if we received a piece of data, perform the necessary validations on it and convert it to a number
        else {
          if (validators === null) {
            packet_data[header_name] = Number(current_state[header_name]);
          }
          else if (typeof validators === 'string') { //if its only a single validation function
            if (typeof Validator[validators] !== 'function') {
              throw new Error('Validator function ' + validators + ' does not exist!');
            }
            else if (Validator[validators](current_state[header_name])) {
              packet_data[header_name] = Number(current_state[header_name]);
            }
            else {
              Logger.warn('Validation failed for ' + header_name + '. Value: ' + current_state[header_name]);
              packet_data[header_name] = null;
            }
          }
          else { //if its in array and there are multiple validation functions
            var failed = false;
            for (var i = 0; i < validators.length; i++) {
              if (typeof Validator[validators[i]] !== 'function') {
                throw new Error('Validator function ' + validators[i] + ' does not exist!');
              }
              else if (!Validator[validators[i]](current_state[header_name])) {
                failed = true;
              }
            }
            if (failed) {
              Logger.warn('Validation failed for ' + header_name + '. Value: ' + current_state[header_name]);
              packet_data[header_name] = null;
            } else {
              packet_data[header_name] = Number(current_state[header_name]);
            }
          }
        }
      });
      sorted_data[packet_type_name] = packet_data;
    });

    return sorted_data;
  }
};

module.exports = PacketParser;