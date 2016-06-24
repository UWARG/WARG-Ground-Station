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
  var Network = {};
  var TelemetryData = {
    headers: []
  };
  var Logger = {};
  var StatusManager = {
    addStatus: sandbox.spy(),
    setStatusCode: sandbox.spy()
  };
  var PacketParser = {};
  var connection = new EventEmitter();

  beforeEach(function () {
    DataRelay.__set__({
      'Network': Network,
      'TelemetryData': TelemetryData,
      'Logger': Logger,
      'StatusManager': StatusManager,
      'PacketParser': PacketParser
    });
  });

  afterEach(function () {
    TelemetryData.headers = [];
    sandbox.restore();

    StatusManager.addStatus.reset();
    StatusManager.setStatusCode.reset();
  });

  describe('init', function () {
    beforeEach(function () {
      Network.connections = [];
      Network.addConnection = sandbox.stub();
      connection.setTimeout = sandbox.spy();
      connection.disconnect = sandbox.spy();
      Network.addConnection.returns(connection);
      Logger.error = sandbox.spy();
    });

    afterEach(function () {
      Network.connections = [];
      connection.removeAllListeners();
    });

    it('should correctly add a connection with name of data relay', function () {
      DataRelay.init();
      expect(Network.addConnection).to.have.been.calledWith('data_relay', network_config.get('datarelay_host'), network_config.get('datarelay_port'));
    });

    it('should disconnect the data relay connection if it already exists', function () {
      Network.connections['data_relay'] = connection;
      DataRelay.init();
      expect(connection.disconnect).to.have.been.callCount(1);
    });

    it('should set the correct timeout for the connection', function () {
      DataRelay.init();
      expect(connection.setTimeout).to.have.been.calledWith(network_config.get('datarelay_timeout'));
    });

    it('given data event call parseHeaders if its the first packet of data', function () {
      var data = '654,654';
      var data_buffer = new Buffer(data);
      var parseHeadersSpy = sandbox.stub(DataRelay, 'parseHeaders');
      TelemetryData.headers = [];
      DataRelay.init();
      connection.emit('data', data_buffer);
      expect(parseHeadersSpy).to.have.been.calledWith(data);
    });

    it('given data event call parseData if its not the first packet of data', function () {
      var data = '654,654';
      var data_buffer = new Buffer(data);
      TelemetryData.headers = ['header1', 'header2'];
      var parseDataSpy = sandbox.stub(DataRelay, 'parseData');
      DataRelay.init();
      connection.emit('data', data_buffer);
      expect(parseDataSpy).to.have.been.calledWith(data);
    });

    it('warn the user if it receives a blank data packet', function () {
      DataRelay.init();
      connection.emit('data', null);
      expect(Logger.error).to.have.been.calledWith('Got a blank packet from the data relay station. Value: null');
    });

    it('should clear TelemetryData headers on a connect event', function () {
      TelemetryData.headers = ['header1'];
      DataRelay.init();
      connection.emit('connect');
      expect(TelemetryData.headers).to.eql([]);
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

  describe('parseData', function () {
    beforeEach(function () {
      TelemetryData.setHeadersFromString = sandbox.spy();
      PacketParser.checkForMissingHeaders = sandbox.spy();
      Logger.debug = sandbox.spy();
      Logger.data = sandbox.spy();
    });
    it('should set telemetry data headers', function () {
      var data = 'header1,header2';
      DataRelay.parseHeaders(data);
      expect(TelemetryData.setHeadersFromString).to.have.been.calledWith(data);
    });

    it('should check for any missing headers', function () {
      var data = 'header1,header2';
      TelemetryData.headers = ['header1'];
      DataRelay.parseHeaders(data);
      expect(PacketParser.checkForMissingHeaders).to.have.been.calledWith(TelemetryData.headers);
    });

    it('should log headers', function () {
      var data = 'header1,header2';
      DataRelay.parseHeaders(data);
      expect(Logger.debug).to.have.callCount(1);
      expect(Logger.data).to.have.callCount(1);
    });

    it('should add received headers status code', function () {
      var data = 'header1,header2';
      DataRelay.parseHeaders(data);
      expect(StatusManager.addStatus).to.have.callCount(1);
    });
  });
  describe('parseData', function () {
    beforeEach(function () {
      TelemetryData.emitPackets = sandbox.spy();
      PacketParser.parseData = sandbox.stub();
      Logger.data = sandbox.spy();
    });
    it('should set TelemetryData current state', function () {
      var data = '324,234';
      PacketParser.parseData.returns(data);
      DataRelay.parseData(data);
      expect(PacketParser.parseData).to.have.been.calledWith(data, TelemetryData.headers);
      expect(TelemetryData.current_state).to.be.eql(data);
    });

    it('emit data packets', function () {
      var data = '324,234';
      PacketParser.parseData.returns(data);
      DataRelay.parseData(data);
      expect(TelemetryData.emitPackets).to.have.been.calledWith(TelemetryData.current_state);
    });

    it('log data packet contents', function () {
      DataRelay.parseData('something');
      expect(Logger.data).to.have.callCount(1);
    });

    it('set timeout status code to false', function () {
      DataRelay.parseData('something');
      expect( StatusManager.setStatusCode).to.have.callCount(1);
    });
  });
});