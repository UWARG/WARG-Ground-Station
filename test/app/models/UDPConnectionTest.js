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
  var os = {};

  var test_network_address = '192.168.1.255'
  var test_network =  {
  'lo': [
    {
      address: '127.0.0.1',
      netmask: '255.0.0.0',
      family: 'IPv4',
      mac: '00:00:00:00:00:00',
      internal: true
    },
    {
      address: '::1',
      netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      family: 'IPv6',
      mac: '00:00:00:00:00:00',
      internal: true
    }
  ],
  'eth0': [
    {
      address: '192.168.1.108',
      netmask: '255.255.255.0',
      family: 'IPv4',
      mac: '01:02:03:0a:0b:0c',
      internal: false
    },
    {
      address: 'fe80::a00:27ff:fe4e:66a1',
      netmask: 'ffff:ffff:ffff:ffff::',
      family: 'IPv6',
      mac: '01:02:03:0a:0b:0c',
      internal: false
    }
  ]
};

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
    'childProcess':childProcess,
    'os':os
  });
  beforeEach(function(){
    dgram.createSocket = sandbox.stub();
    dgram.createSocket.withArgs('udp4').returns(server);
    server.bind = sandbox.stub();
    server.setBroadcast = sandbox.stub();
    server.address = sandbox.stub();
    server.address.withArgs().returns({'port':'test_port'});
    server.send = sandbox.spy();
    server.close = sandbox.spy();
    childProcess.exec = sandbox.stub();

    Logger.error = sandbox.spy();
    Logger.debug = sandbox.spy();
    Logger.data = sandbox.spy();
    Logger.info = sandbox.spy();

    c = new UDPConnection(network_config.get('datarelay_port'),network_config.get('datarelay_udp_timeout'));

    os.networkInterfaces = sandbox.stub();
    os.networkInterfaces.withArgs().returns(test_network);
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
  it('should send a UDP request', function () {
      var listener = sinon.spy();
      c.on('receiveIP', listener);
      c.connect('255.255.255.0');
      server.emit('listening');

      var message = new Buffer(ip.address() + ':' + 'test_port');
      expect(server.send).to.have.been.calledWith(message,0,message.length,network_config.get('datarelay_port'),'255.255.255.0',sinon.match.any);
      expect(listener).to.have.been.calledWith();
  });
  it('should close properly', function () {
      var listener = sinon.spy();
      c.on('timeout', listener);
      c.connect('255.255.255.0');
      server.emit('listening');
      server.emit('close');
  });

  it('should find the proper broadcast address', function () {
      var listener = sinon.spy();
      c.on('findBroadcast', listener);
      c.findConnection();
      expect(listener).to.have.been.calledWith(test_network_address);
  });
});
