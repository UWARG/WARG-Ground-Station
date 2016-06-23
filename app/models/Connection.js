/**
 * @author Serge Babayan
 * @module models/Connection
 * @requires util/Logger
 * @requires net
 * @requires util
 * @requires events
 * @requires config/advanced-config
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Represents a TCP connection. This is used as a wrapper for the connection to the
 * data relay
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
var Connection = function (options) {
  if (options && options.name && options.host && options.port) {
    this.name = options.name;
    this.host = options.host;
    this.port = options.port;
  }
  else {
    throw new Error("Connection name,host, and port parameters are all required!")
  }

  /**
   * Whether the connection has been closed
   * @type {boolean}
   */
  this.closed = true;

  // Initialize necessary properties from `EventEmitter` in this instance
  EventEmitter.call(this);

  this.setMaxListeners(advanced_config.get('connection_max_listeners'));

  /**
   * Attempts to connect to the TCP socket
   */
  this.connect = function () {
    Logger.info('Attempting to connect to ' + this.name + ' at ' + this.host + ':' + this.port);
    this.socket.connect(this.port, this.host);
  };

  /**
   * Disconnects from the TCP socket
   */
  this.disconnect = function () {
    Logger.info('Disconnecting from ' + this.name + ' at ' + this.host + ':' + this.port);
    this.socket.destroy();
  };

  /**
   * Reconnects to the socket (same as doing a disconnect and then a connect)
   */
  this.reconnect = function () {
    this.disconnect();
    this.connect();
  };

  /**
   * Attempts to send data through the socket
   * @param data {Object} The data to send
   * @fires Connection:write
   */
  this.write = function (data) {
    this.socket.write(data, 'utf8', function (error) {
      if (!error) {
        /**
         * Emitted if data was successfully sent through the socket. Passes back the data sent
         * @event Connection:write
         * @type {Object}
         */
        this.emit('write', data);
        Logger.info("Network " + this.name + " Sent: " + data);
      }
    }.bind(this));
  };

  /**
   * A reference to the socket.
   * @type {net.Socket}
   */
  this.socket = new net.Socket();

  this.socket.on('connect', function () {
    /**
     * Emitted when the socket has successfully connected
     * @event Connection:connect
     * @type {null}
     */
    this.emit('connect');
    this.closed = false;
    Logger.info('Sucessfully connected to ' + this.name + ' with host ' + this.host + ' and port ' + this.port);
  }.bind(this));

  this.socket.on('error', function (error) {
    this.closed = true;
    Logger.error('Problem with ' + this.name + ' connection (host: ' + this.host + ',port:' + this.port + ')\n'
      + error.toString());

    /**
     * Emitted when an error has occurred on the socket. Does not throw an error if there are no listeners
     * @event Connection:socket_error
     * @type {Object}
     */
    this.emit('socket_error', error); //NOTE: named socket_error and not error so as to not throw an exception
  }.bind(this));

  /**
   * Emitted when the socket has timed out (receiving no data but still connected)
   * @event Connection:timeout
   * @type {null}
   */
  this.socket.on('timeout', function () {
    this.emit('timeout');
    //TODO: Set the timeout programmatically in the log message
    Logger.error('Timed out for 5s for ' + this.name + ' connection (host: ' + this.host + ',port:' + this.port + ')');
  }.bind(this));

  /**
   * Emitted when the socket has been closed. Passes true if it closed due to an error
   * @event Connection:close
   * @type {bool}
   */
  this.socket.on('close', function (had_error) {
    this.emit('close', had_error);
    this.closed = true;
    if (had_error) {
      Logger.error('Connection to  ' + this.name + ' closed due to an error: Not reconnecting');
    } else {
      Logger.warn('Connection to ' + this.name + ' closed: Not reconnecting');
    }
  }.bind(this));

  /**
   * Emitted when the socket has received a packet of data
   * @event Connection:data
   * @type {Buffer}
   */
  this.socket.on('data', function (data) {
    this.emit('data', data);
  }.bind(this));
};

util.inherits(Connection, EventEmitter);

module.exports = Connection;