/**
 * @author Stephen Cholvat
 * @module models/UDPConnection
 * @requires util/Logger
 * @requires net
 * @requires util
 * @requires events
 * @requires config/advanced-config
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Represents a UDP connection. Used to find IP address of data-relay
 * @extends EventEmitter
 * @see https://nodejs.org/api/net.html
 */

var net = require('net');
var util = require('util');
var EventEmitter = require('events');
var Logger = require('../util/Logger');
var advanced_config = require('../../config/advanced-config');

/**
 * @param options Required options to initialize the TCP connection
 * @param options.name The unique name of the connection
 * @param options.host The hostname (ie. 192.168.1.101)
 * @param options.port The port for the connection (ie. 3000)
 * @throws {Error} If one of the parameters weren't provided
 * @constructor
 */
var UDPConnection = function (port) {

  /**
   * Timeout for the socket in milliseconds. Defaults to 1 second
   * @type {int}
   * @private
   */
  var timeout = 1000;

  /**
   * Whether the connection is closed
   * @type {boolean}
   * @private
   */
  var closed = true;

  /**
   * A reference to the socket.
   * @type {net.Socket|EventEmitter}
   * @private
   */
  var socket = new net.Socket();
  socket.setTimeout(timeout);

  // Initialize necessary properties from `EventEmitter` in this instance
  EventEmitter.call(this);

  connect
  setTimeout
  getTimeout

  
  //listeners
  recieveIP
  timeout

};

util.inherits(Connection, EventEmitter);

module.exports = Connection;