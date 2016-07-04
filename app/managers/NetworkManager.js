/**
 * @author Serge Babayan
 * @module managers/NetworkManager
 * @requires models/Connection
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Stores and manages all network connections for the app. Stores a connection by its name, and only allows
 * for having a single instance of a certain type of connection.
 * @see https://nodejs.org/api/net.html
 */

var Connection = require('../models/Connection');
var _ = require('underscore');

var NetworkManager = new function(){
  /**
   * A hash of connections, where the key is the connection name, and value is the actual Connection object.
   * @type {Object}
   * @private
   */
  var connections = {};

  /**
   * Adds a connection to the NetworkManager, and attempts to connect it.
   * Note that this does not check if an existing connection of the same name exists. Will just overwrite the connection in that case.
   * @function addConnection
   * @param {String} name Unique connection name
   * @param {String} host Host(ie. 192.168.1.101)
   * @param {String} port The port to connect to
   * @returns {Connection} The newly created connection
   * @example <caption>Say we want to connect data relay to 192.168.1.101:1234</caption>
   * //This will create a new connection for the data relay and attempt to connect to it
   * NetworkManager.addConnection('data_relay', '192.168.1.101', '1234');
   */
  this.addConnection = function(name, host, port){
    var new_connection = new Connection({
      name: name,
      host: host,
      port: port
    });
    connections[name] = new_connection;
    new_connection.connect();
    return new_connection;
  };

  /**
   * Disconnects and removes a connection and all its event listeners from Network manager.
   * Does nothing if the connection does not exist
   * @function removeConnection
   * @param {String} name Unique connection name
   */
  this.removeConnection = function(name){
    if(connections[name]){
      connections[name].destroy();
      delete connections[name];
    }
  };

  /**
   * Disconnects and removes all connections, including their event listeners from the app.
   * Use with caution.
   * @function removeAllConnections
   */
  this.removeAllConnections = function(){
    _.each(connections, function(connection, connection_name){
      connection.destroy();
      delete connections[connection_name];
    });
  };

  /**
   * Returns the stored connection as specified by the its name. Returns null if the connection doesn't exist
   * @function getConnectionByName
   * @param {String} name The unique name for the connection
   * @returns {Connection}
   */
  this.getConnectionByName = function(name){
    if(connections[name]){
      return connections[name];
    }
    return null;
  };

  /**
   * Disconnects any network connections
   * @function disconnectAllConnections
   */
  this.disconnectAllConnections = function(){
    _.each(connections, function(connection, connection_name){
      connection.disconnect();
    });
  };
};

module.exports = NetworkManager;