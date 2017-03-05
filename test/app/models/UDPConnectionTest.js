var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../../../tests-config')(chai);
var EventEmitter = require('events');
var network_config = require('../../../config/network-config');
var ip = require('ip');
var CommandLineOutputs = require('../../helpers/CommandLineOutputs');

describe('UDPConnection',function(){
  var sandbox = sinon.sandbox.create();
  var UDPConnection = rewire('../../../app/models/UDPConnection');
  var dgram = {};
  var Logger = {};
  var childProcess= {};
  var server = new EventEmitter();
  var c; //holds UDP connection object

  var ipconfig_output = "\
  Windows IP Configuration \
  Ethernet adapter Ethernet: \
     Media State . . . . . . . . . . . : Media disconnected \
     Connection-specific DNS Suffix  . : \
  Wireless LAN adapter Local Area Connection* 2: \
     Media State . . . . . . . . . . . : Media disconnected \
     Connection-specific DNS Suffix  . : \
  Wireless LAN adapter Local Area Connection* 4: \
     Media State . . . . . . . . . . . : Media disconnected \
     Connection-specific DNS Suffix  . : \
  Wireless LAN adapter Wi-Fi: \
     Connection-specific DNS Suffix  . : uwaterloo.ca \
     IPv6 Address. . . . . . . . . . . : 2620:101:f000:700:f5f4:85fb:54f5:9328 \
     Temporary IPv6 Address. . . . . . : 2620:101:f000:700:b494:b53f:f575:666a \
     Link-local IPv6 Address . . . . . : fe80::f5f4:85fb:54f5:9328%13 \
     IPv4 Address. . . . . . . . . . . : 10.20.13.186 \
     Subnet Mask . . . . . . . . . . . : 255.255.0.0 \
     Default Gateway . . . . . . . . . : fe80::be16:65ff:fef4:d000%13 \
                                        10.20.0.1 \
  Tunnel adapter Local Area Connection* 3: \
     Connection-specific DNS Suffix  . : \
     IPv6 Address. . . . . . . . . . . : 2001:0:d4e:efaa:1c76:4d5:7e9e:8332 \
     Subnet Mask . . . . . . . . . . . : 255.255.255.0 \
     Link-local IPv6 Address . . . . . : fe80::1c76:4d5:7e9e:8332%16 \
     Default Gateway . . . . . . . . . : ";

  var rinfo = new Object();//used for message listener
  Object.defineProperty(rinfo,'address',{
  configurable: true,
  writable: true,
  value: 'static'
  });
  rinfo.address = 'IPaddress';

  UDPConnection.__set__({
    'Logger': Logger,
    'dgram':dgram,
    'childProcess':childProcess
  });
  beforeEach(function(){
    dgram.createSocket = sandbox.stub();
    dgram.createSocket.withArgs('udp4').returns(server);
    server.bind = sandbox.stub();
    server.close = sandbox.spy();
    childProcess.exec = sandbox.stub();

    Logger.error = sandbox.spy();
    Logger.debug = sandbox.spy();
    Logger.data = sandbox.spy();
    Logger.info = sandbox.spy();

    c = new UDPConnection(network_config.get('datarelay_port'),network_config.get('datarelay_udp_timeout'));
  });
  afterEach(function(){
    sandbox.restore();
    server.removeAllListeners();
  });
  it('should bind to server', function () {
      c.connect('255.255.255.0');
      expect(server.bind).to.have.been.calledWith();
  });
  it('should create error listener', function () {
      c.connect('255.255.255.0');
      expect(server.listenerCount('error')).to.equal(1);

      server.emit('error', new Error('test error'));
      expect(server.close).to.have.been.calledWith();
  });
  it('should create message listener', function () {
      var listener = sinon.spy();
      c.on('receiveIP', listener);
      c.connect('255.255.255.0');
      expect(server.listenerCount('message')).to.equal(1);
  });
  it('should parse multiple TCP networks', function () {
      var listener = sinon.spy();
      c.on('receiveIP', listener);
      c.connect('255.255.255.0');
      var message = 'port1:alias1,port2:alias2,port3';
      server.emit('message', message,rinfo);
      expect(listener).to.have.callCount(3);
  });
  it('should parse TCP network with alias', function () {
      var listener = sinon.spy();
      c.on('receiveIP', listener);
      c.connect('255.255.255.0');
      var message = 'port:alias';
      server.emit('message', message,rinfo);
      expect(listener).to.have.been.calledWith(rinfo.address, 'port','alias');
  });
  it('should parse TCP network without alias', function () {
      var listener = sinon.spy();
      c.on('receiveIP', listener);
      c.connect('255.255.255.0');
      var message = 'port';
      server.emit('message', message,rinfo);
      expect(listener).to.have.been.calledWith(rinfo.address, 'port',undefined);
  });
  describe('windows OS tests',function(){
    UDPConnection.__set__({
      'os':'windows'
    });

    it('should parse ipconfig', function () {
        var listener = sinon.spy();
        c.on('findBroadcast', listener);
        childProcess.exec.withArgs('ipconfig').returns(CommandLineOutputs.ipconfig_out);
        c.findConnection();
        expect(listener).to.have.callCount(2);
    });
  });



});
