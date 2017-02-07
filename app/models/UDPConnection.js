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
var exec = require("child_process").exec;
var dgram = require('dgram');

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
        Logger.error(`server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', function(msg, rinfo){
        //the message should include the port number
        var destAddress = rinfo.address.toString();
        var destPort = msg.toString();
        self.emit('receiveIP',destAddress,destPort);
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
    var os = process.platform.toString();

    //Windows
    if (os.includes("win")) {
        //run and parse ipconfig
        exec("ipconfig", function(err, stdout, stderr) {

            if (err) {
              Log.error(err);
            } else {
              var regex = /(?:Subnet Mask)(?:.| )*: ([\d.]*)/g;
              var localIP = ip.address();
              match = regex.exec(stdout);

              while (match != null) {
                //check if match is in IP format
                if(ip.isV4Format(match[1])){
                  var broadcast = ip.or(ip.not(match[1]), localIP);
                  self.connect(broadcast.toString());
                }
                match = regex.exec(stdout);
              }
          }
        });
    }
    //Linux
    else {
        //run and parse ifconfig
        exec("ifconfig", function(err, stdout, stderr) {
            if (err) {
                Log.error(err);
            } else {
              //Searches for any string Bcast:#.#.#.# or broadcast:#.#.#.#
              var regex = /(?:Bcast|broadcast):([\d.]*)/g;
              var localIP = ip.address();
              match = regex.exec(stdout);

              while (match != null) {
                //check if match is in IP format
                if(ip.isV4Format(match[1])){
                  var broadcast = match[1];
                  self.connect(broadcast.toString());
                }
                match = regex.exec(stdout);
              }

            }
        });
    }
  }

};
util.inherits(UDPConnection, EventEmitter);

module.exports = UDPConnection;
