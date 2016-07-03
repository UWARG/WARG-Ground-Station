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
   * @param name
   * @param host
   * @param port
   * @returns {Connection}
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
   * Returns the stored connection as specified by the its name. Returns null if the connection doesn't exist
   * @param {String} key
   * @returns {Connection}
   */
  this.getConnectionByKey = function(key){
    if(connections[key]){
      return connections[key];
    }
    return null;
  };

  /**
   * Disconnects any network connections
   * @function disconnectAll
   */
  this.disconnectAll = function(){
    var connection = Object.keys(connections);
    for (var i = 0; i < connection.length; i++) {
      connections[connection[i]].disconnect();
    }
  };
};

module.exports = NetworkManager;