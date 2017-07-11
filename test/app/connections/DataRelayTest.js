var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../../../tests-config')(chai);
var EventEmitter = require('events');
var network_config = require('../../../config/network-config');

describe('DataRelay', function () {
  var sandbox = sinon.sandbox.create();
  var DataRelay = rewire('../../../app/connections/DataRelay');
  var NetworkManager = {};
  var UDPConnection = {};
  var udp_instance = new EventEmitter();

  var TelemetryData = {};
  var Logger = {};
  var StatusManager = {
    addStatus: sandbox.spy(),
    setStatusCode: sandbox.spy()
  };
  var PacketParser = {};
  var connection = new EventEmitter();

var data_relay_mode = network_config.get('datarelay_legacy_mode');

  beforeEach(function () {
    udp_instance.findConnection = sinon.spy();

    UDPConnection = sinon.spy(function () {
      return udp_instance;
    });

    DataRelay.__set__({
      'NetworkManager': NetworkManager,
      'TelemetryData': TelemetryData,
      'Logger': Logger,
      'StatusManager': StatusManager,
      'PacketParser': PacketParser,
      'UDPConnection':UDPConnection
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('init', function () {
    beforeEach(function () {
      NetworkManager.getConnectionByName = sandbox.stub();
      NetworkManager.getConnectionByName.withArgs('data_relay').returns(null);
      NetworkManager.removeAllConnections = sandbox.spy();
      NetworkManager.addConnection = sandbox.stub();
      NetworkManager.addConnection.returns(connection);
      connection.setTimeout = sandbox.spy();
      connection.disconnect = sandbox.spy();
      Logger.error = sandbox.spy();
      Logger.debug = sandbox.spy();
      Logger.data = sandbox.spy();
      Logger.info = sandbox.spy();
      TelemetryData.setHeaders = sandbox.spy();
      TelemetryData.setCurrentStateFromString = sandbox.spy();
      TelemetryData.emitPackets = sandbox.spy();
      TelemetryData.clearHeaders = sandbox.spy();
      TelemetryData.setHeadersFromString = sandbox.spy();
      TelemetryData.getHeaders = sandbox.stub();
      TelemetryData.getHeaders.returns([]);
      TelemetryData.getCurrentState = sandbox.stub();
      TelemetryData.getCurrentState.returns({});
      PacketParser.checkForMissingHeaders = sandbox.spy();
    });

    afterEach(function () {
      connection.removeAllListeners();
      udp_instance.removeAllListeners();
      network_config.set('datarelay_legacy_mode',data_relay_mode);
    });

    describe('auto-discovery', function(){
      var data_relay_mode = network_config.get('datarelay_legacy_mode');
      beforeEach(function(){
        network_config.get = sandbox.stub();
        network_config.get.withArgs('datarelay_legacy_mode').returns(false);
      });


      it('should disconnect the data relay connection if it already exists', function () {
        NetworkManager.getConnectionByName.withArgs('data_relay').returns(connection);
        DataRelay.init();
        expect(NetworkManager.removeAllConnections).to.have.been.calledWith('data_relay');
      });

      it('should successfully call UDPConnection ', function () {
        DataRelay.init();
        expect(udp_instance.findConnection).to.have.been.calledWith();
      });

      it('should successfully listen to UDPConnection ', function () {
        DataRelay.init();
        expect(udp_instance.listenerCount('receiveIP')).to.equal(1);
        expect(udp_instance.listenerCount('timeout')).to.equal(1);

        udp_instance.emit('timeout');
        expect(StatusManager.setStatusCode).to.have.been.calledWith('TIMEOUT_UDP', true);

        udp_instance.emit('receiveIP', 'address', 'port');
        expect(NetworkManager.addConnection).to.have.been.calledWith('data_relay','address', 'port');
      });
    });


    describe('legacy-mode', function(){
        beforeEach(function(){
          network_config.get = sandbox.stub();
          network_config.get.withArgs('datarelay_legacy_mode').returns(true);
        });

      it('should correctly add a connection with name of data relay in legacy mode', function () {
        DataRelay.init();
        expect(NetworkManager.addConnection).to.have.been.calledWith('data_relay', network_config.get('datarelay_legacy_host'), network_config.get('datarelay_legacy_port'));
      });

      it('should successfully listen to appripriate events on the connection in legacy mode', function () {
        DataRelay.init();
        expect(connection.listenerCount('connect')).to.equal(1);
        expect(connection.listenerCount('close')).to.equal(1);
        expect(connection.listenerCount('timeout')).to.equal(1);
        expect(connection.listenerCount('write')).to.equal(1);
        expect(connection.listenerCount('data')).to.equal(1);
      });

      it('should set the correct tcp timeout for the connection', function () {
        DataRelay.init();
        expect(connection.setTimeout).to.have.been.calledWith(network_config.get('datarelay_tcp_timeout'));
      });
  });

    describe('data-parsing', function(){
      it('given data event call parseHeaders if its the first packet of data', function () {
        var data = '654,654';
        var data_buffer = new Buffer(data);
        TelemetryData.getHeaders.returns([]);
        DataRelay.init();
        connection.emit('data', data_buffer);
        expect(TelemetryData.setHeadersFromString).to.have.been.calledWith(data);
        expect(PacketParser.checkForMissingHeaders).to.have.been.calledWith([]);
        expect(Logger.debug).to.have.been.calledWith('Network data_relay Received headers: 654,654');
        expect(Logger.data).to.have.been.calledWith(JSON.stringify(TelemetryData.getHeaders()), 'DATA_RELAY_HEADERS');
        expect(StatusManager.addStatus).to.have.been.calledWith('Received headers from data_relay');
      });

      it('given data event call parseData if its not the first packet of data', function () {
        var data = '654,654';
        var data_buffer = new Buffer(data);
        TelemetryData.getHeaders.returns(['header1', 'header2']);
        TelemetryData.getCurrentState.returns({header1: '654', header2: '654'});
        DataRelay.init();
        connection.emit('data', data_buffer);
        expect(TelemetryData.setCurrentStateFromString).to.have.been.calledWith(data);
        expect(TelemetryData.emitPackets).to.have.callCount(1);
        expect(Logger.data).to.have.been.calledWith(JSON.stringify(TelemetryData.getCurrentState()), 'DATA_RELAY_DATA');
        expect(StatusManager.setStatusCode).to.have.been.calledWith('TIMEOUT_DATA_RELAY', false);
      });

      it('warn the user if it receives a blank data packet', function () {
        DataRelay.init();
        connection.emit('data', null);
        expect(Logger.error).to.have.been.calledWith('Got a blank packet from the data relay station. Value: null');
      });

      it('should clear TelemetryData headers on a connect event', function () {
        DataRelay.init();
        connection.emit('connect');
        expect(TelemetryData.clearHeaders).to.have.callCount(1);
      });

      it('should set a status code on a disconnect', function () {
        DataRelay.init();
        connection.emit('close');
        expect(StatusManager.setStatusCode).to.have.been.calledWith('DISCONNECTED_DATA_RELAY', true);
      });

      it('should set a status code on a timeout', function () {
        DataRelay.init();
        connection.emit('timeout');
        expect(StatusManager.setStatusCode).to.have.been.calledWith('TIMEOUT_DATA_RELAY', true);
      });

      it('should set a status code on a write', function () {
        DataRelay.init();
        connection.emit('write');
        expect(StatusManager.addStatus).to.have.been.calledWith('Sent command to data_relay');
      });
    });
  });
});
