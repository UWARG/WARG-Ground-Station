/**
 * @author Stephen Cholvat
 * @module models/UDPConnection
 * @requires util/Logger
 * @requires util
 * @requires events
 * @requires ip
 * @requires child_process
 * @requires dgram
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Represents a UDP connection. Used to find IP address of data-relay
 * @extends EventEmitter
 * @see https://nodejs.org/api/net.html
 */

var util = require('util');
var EventEmitter = require('events');
var Logger = require('../util/Logger');
var ip = require('ip');
var childProcess = require("child_process");
var dgram = require('dgram');
const os = require('os');

/**
 * @param port The port for the UDP connection
 * @constructor
 */
var UDPConnection = function (port, timeout) {
  var self=this;

  /**
   * Whether the connection is closed
   * @type {boolean}
   * @private
   */
  var closed = true;

  // Initialize necessary properties from `EventEmitter` in this instance
  EventEmitter.call(this);

/**
  *@connect
  *Connect to UDP at given broadcastIP
  */
  this.connect = function(broadcastIP){

    var server = dgram.createSocket('udp4');

    server.on('error', function(err){
        Logger.error('server error:\n${err.stack}');
        server.close();
    });

    server.on('message', function(msg, rinfo){
        //the message should be in the format port:alias,port:alias,...
        var destAddress = rinfo.address.toString();
        var networks = msg.toString().split(',');
        for(var i=0; i<networks.length; i++){
          var splitMessage = networks[i].split(':');
          var destPort = splitMessage[0];
          var alias = splitMessage[1];
          self.emit('receiveIP',destAddress,destPort, alias);
        }

        server.close();
    });

    server.on('close', function(msg, rinfo){
        closed = true;
    });

    server.on('listening', function(){
        closed = false;
        var address = server.address();

        //send IP and port to data_relay UDP port
        var message = new Buffer(ip.address() + ':' + address.port);

        server.setBroadcast(true);
        server.send(message, 0, message.length, port, broadcastIP, function(err, bytes) {
            if (err){
              Logger.error(err);
            }
            Logger.info('UDP message sent to ' + broadcastIP + ':' + port);
        });

        //timeout
        setTimeout(function() {
            if (!closed) {
                Logger.error('UDP connection timed out');
                self.emit('timeout', timeout);
                server.close();
            }
        }, timeout);
    });
  server.bind();
  }

  /**
  *@findConnection
  *Finds broadcast IP to connect to UDP
  */
  this.findConnection = function () {
    Logger.info("Connecting to UDP on port " +port);
    var networks = os.networkInterfaces();
    //console.log(networks);
    for(network_key in networks){
      var network = networks[network_key];
      for(var i=0; i<network.length; i++){
        //check IPv4 format
        if((network[i].internal === false) && (ip.isV4Format(network[i].netmask))){
          var broadcast_address = ip.or(ip.not(network[i].netmask), network[i].address).toString();
          self.emit('findBroadcast',broadcast_address);
          self.connect(broadcast_address);
        }
      }
    }
  }

};
util.inherits(UDPConnection, EventEmitter);

module.exports = UDPConnection;
