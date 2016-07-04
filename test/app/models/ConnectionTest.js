var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../../../tests-config')(chai);
var EventEmitter = require('events');
var _ = require('underscore');

describe('Connection', function () {
  var Connection = rewire('../../../app/models/Connection');
  var Logger = {};
  var socket = {};
  var connection_name = 'test_name';
  var connection_host = 'connection_host';
  var connection_port = 4044;

  function createConnection(overrides) {
    var options = {
      name: connection_name,
      host: connection_host,
      port: connection_port
    };
    if(overrides){
      options =  _.extend(options, overrides);
    }
    return new Connection(options);
  }

  beforeEach(function () {
    socket = new EventEmitter();
    socket.setTimeout = sinon.spy();
    Logger.info = sinon.spy();
    Logger.error = sinon.spy();
    Logger.warn = sinon.spy();

    Connection.__set__({
      'Logger': Logger,
      'net': {
        Socket: function () {
          return socket;
        }
      }
    });
  });

  describe('constructor', function () {
    it('should throw error if name paramater isnt provided', function () {
      var create = function(){
        createConnection({name: null});
      };
      expect(create).to.throw(Error, 'Connection name,host, and port parameters are all required!');
    });

    it('should throw error if host paramater isnt provided', function () {
      var create = function(){
        createConnection({host: null});
      };
      expect(create).to.throw(Error, 'Connection name,host, and port parameters are all required!');
    });

    it('should throw error if port paramater isnt provided', function () {
      var create = function(){
        createConnection({port: null});
      };
      expect(create).to.throw(Error, 'Connection name,host, and port parameters are all required!');
    });

    it('should set name, host and port given valid parameters', function () {
      var connection = createConnection();
      expect(connection.name).to.be.equal(connection_name);
      expect(connection.host).to.be.equal(connection_host);
      expect(connection.port).to.be.equal(connection_port);
    });

    it('should initialize timeout to 5000 milliseconds', function () {
      var c = createConnection();
      expect(c.getTimeout()).to.be.equal(5000);
    });

    it('should set the socket timeout to 5000 milliseconds', function () {
      var c = createConnection();
      expect(socket.setTimeout).to.have.been.calledWith(5000);
    });

    it('should initialize isClosed to true', function () {
      var c = createConnection();
      expect(c.isClosed()).to.be.equal(true);
    });
  });

  describe('setTimeout', function () {
    it('should set and get timeout', function () {
      var c = createConnection();
      c.setTimeout(4555);
      expect(c.getTimeout()).to.be.equal(4555);
    });

    it('should set timeout for the socket', function () {
      var c = createConnection();
      c.setTimeout(4555);
      expect(socket.setTimeout).to.have.been.calledWith(4555);
    });
  });

  describe('write', function () {
    var c;
    beforeEach(function(){
      socket.write = sinon.stub();
      c = createConnection();
    });

    it('should write to the socket', function () {
      c.write('hello!');
      expect(socket.write).to.have.been.calledWith('hello!');
    });

    it('should not write to the socket and warn user if blank data packet was received', function () {
      c.write('');
      expect(socket.write).to.have.callCount(0);
      expect(Logger.error).to.have.been.calledWith('No data written to the ' + connection_name + ' connection as a blank data packet was received');
    });

    it('should emit a write event with the data written', function () {
      c.emit = sinon.spy();
      socket.write = function(data, type, callback){
        callback(false);
      };
      c.write('hello!');
      expect(c.emit).to.have.been.calledWith('write','hello!');
    });

    it('should log written contents', function () {
      c.emit = sinon.spy();
      socket.write = function(data, type, callback){
        callback(false);
      };
      c.write('hello!');
      expect(Logger.info).to.have.been.calledWith("Network " + connection_name + " Sent: hello!");
    });

    it('should warn user if an error occurred trying to write to the connection', function () {
      c.emit = sinon.spy();
      socket.write = function(data, type, callback){
        callback(true);
      };
      c.write('hello!');
      expect(Logger.error).to.have.been.calledWith('An error occurred writing to the ' + connection_name + ' connection. Attempted write: hello!');
    });
  });

  describe('connection operations', function () {
    var c;

    beforeEach(function(){
      c = createConnection();
      socket.end = sinon.spy();
      socket.connect = sinon.spy();
    });

    it('should disconnect and connect the socket given a reconnect', function () {
      c.reconnect();
      expect(socket.end).to.have.callCount(1);
      expect(socket.connect).to.have.been.calledWith({host: connection_host, port: connection_port});
    });

    it('should end socket and warn user given a disconnect', function () {
      c.disconnect();
      expect(socket.end).to.have.callCount(1)
      expect(Logger.info).to.have.been.calledWith('Disconnecting from ' + connection_name + ' at ' + connection_host + ':' + connection_port);
    });

    it('should connect socket and inform user given a connect', function () {
      c.connect();
      expect(socket.connect).to.have.been.calledWith({host: connection_host, port: connection_port});
      expect(Logger.info).to.have.been.calledWith('Attempting to connect to ' + connection_name + ' at ' + connection_host + ':' + connection_port);
    });

    it('should disconnect and remove all listeners from a socket given a destroy', function () {
      socket.on('write', function(){});
      c.destroy();
      expect(socket.end).to.have.callCount(1);
      expect(socket.listenerCount()).to.equal(0);
    });
  });

  describe('connection events', function () {
    var c;

    beforeEach(function(){
      c = createConnection();
    });

    it('given connect event from socket should inform user and emit out another connect event', function () {
      var listener = sinon.spy();
      c.on('connect', listener);
      socket.emit('connect');
      expect(c.isClosed()).to.be.equal(false);
      expect(Logger.info).to.have.been.calledWith('Sucessfully connected to ' + connection_name + ' with host ' + connection_host + ' and port ' + connection_port);
      expect(listener).to.have.callCount(1);
    });

    it('given error event from socket should warn user and emit out a socket_error event', function () {
      var listener = sinon.spy();
      var error = {toString: function(){return 'error_message'}};
      c.on('socket_error', listener);
      socket.emit('error', error);
      expect(Logger.error).to.have.been.calledWith('Problem with ' + connection_name + ' connection (host: ' + connection_host + ',port:' + connection_port + ')\n'
        + 'error_message');
      expect(listener).to.have.been.calledWith(error);
    });

    it('given timeout event from socket should inform user and emit out another timeout event with the timeout amount', function () {
      var listener = sinon.spy();
      c.setTimeout(3000);
      c.on('timeout', listener);
      socket.emit('timeout');
      expect(listener).to.have.calledWith(3000);
      expect(Logger.error).to.have.been.calledWith('Timed out for 3s for ' + connection_name + ' connection (host: ' + connection_host + ',port:' + connection_port + ')');
    });

    it('given close event from socket should warn user if it wasnt due to an error and emit another close event', function () {
      var listener = sinon.spy();
      c.on('close', listener);
      socket.emit('close', false);
      expect(listener).to.have.been.calledWith(false);
      expect(c.isClosed()).to.be.equal(true);
      expect(Logger.warn).to.have.been.calledWith('Connection to ' + connection_name + ' closed: Not reconnecting');
    });

    it('given close event from socket should error to user if it was due to an error and emit another close event', function () {
      var listener = sinon.spy();
      c.on('close', listener);
      socket.emit('close', true);
      expect(listener).to.have.calledWith(true);
      expect(Logger.error).to.have.been.calledWith('Connection to ' + connection_name + ' closed due to an error: Not reconnecting');
    });

    it('given data event from socket should re-emit a data event with the same payload', function () {
      var listener = sinon.spy();
      var data = {
        hello: 'wasup'
      };
      c.on('data', listener);
      socket.emit('data', data);
      expect(listener).to.have.calledWith(data);
    });
  });
});