var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../../../tests-config')(chai);

describe('SimulationManager', function () {
  var SimulationManager = {};
  var TelemetryData = {};
  var Logger = {};
  var NetworkManager = {};
  var StatusManager = {};
  var clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    SimulationManager = rewire('../../../app/managers/SimulationManager');
    TelemetryData.getCurrentState = sinon.stub();
    TelemetryData.getCurrentState.returns({});
    TelemetryData.emitPackets = sinon.spy();
    TelemetryData.clearHeaders = sinon.spy();
    TelemetryData.getHeaders = sinon.stub();
    TelemetryData.getHeaders.returns(['header1', 'header2']);
    TelemetryData.setCurrentStateFromString = sinon.spy();
    NetworkManager.disconnectAllConnections = sinon.spy();
    StatusManager.setStatusCode = sinon.spy();
    SimulationManager.simulation_active = false;
    Logger.data = sinon.spy();

    SimulationManager.__set__({
      'TelemetryData': TelemetryData,
      'Logger': Logger,
      'NetworkManager': NetworkManager,
      'StatusManager': StatusManager
    });

    SimulationManager.clearData();
    if (SimulationManager.isActive()) {
      SimulationManager.toggleSimulation();
    }
  });

  afterEach(function () {
    clock.restore();
  });

  describe('toggleSimulation', function () {
    it('should set the simulation status to true if was false before', function () {
      SimulationManager.toggleSimulation();
      expect(SimulationManager.isActive()).to.equal(true);
    });

    it('should set the simulation status to false if was true before', function () {
      SimulationManager.toggleSimulation();
      SimulationManager.toggleSimulation();
      expect(SimulationManager.isActive()).to.equal(false);
    });

    it('should set the appropriate status code when a simulation is started', function () {
      SimulationManager.toggleSimulation();
      expect(StatusManager.setStatusCode).to.have.been.calledWith('SIMULATION_ACTIVE', true);
    });

    it('should set the appropriate status code when a simulation has stopped', function () {
      SimulationManager.toggleSimulation();
      SimulationManager.toggleSimulation();
      expect(StatusManager.setStatusCode).to.have.been.calledWith('SIMULATION_ACTIVE', false);
    });

    it('should disconnect all network connections on a simulation start', function () {
      SimulationManager.toggleSimulation();
      expect(NetworkManager.disconnectAllConnections).to.have.callCount(1);
    });

    it('should emit data packet at the correct frequency when a data entry is added and simulation started', function () {
      SimulationManager.addDataEntry(['data1', 'data2']);
      SimulationManager.toggleSimulation();
      clock.tick(1000 / SimulationManager.getTransmissionFrequency());
      expect(TelemetryData.setCurrentStateFromString).to.have.been.calledWith('data1,data2');
      expect(TelemetryData.emitPackets).to.have.calledWith();
    });

    it('should emit multiple data packets in order at the correct frequency when multiple data entries added and simulation started', function () {
      SimulationManager.addDataEntry(['data1', 'data2']);
      SimulationManager.addDataEntry(['data3', 'data4']);
      SimulationManager.toggleSimulation();
      clock.tick(1000 / SimulationManager.getTransmissionFrequency());
      expect(TelemetryData.setCurrentStateFromString).to.have.been.calledWith('data1,data2');
      expect(TelemetryData.emitPackets).to.have.callCount(1);
      clock.tick(1000 / SimulationManager.getTransmissionFrequency());
      expect(TelemetryData.setCurrentStateFromString).to.have.been.calledWith('data3,data4');
      expect(TelemetryData.emitPackets).to.have.callCount(2);
    });

    it('should not emit any data if there is no data and the simulation is started', function () {
      SimulationManager.toggleSimulation();
      clock.tick(1000 / SimulationManager.getTransmissionFrequency());
      expect(TelemetryData.emitPackets).to.have.callCount(0);
    });

    it('should not emit any data if clearData was called after added data entries and simulation is started', function () {
      SimulationManager.addDataEntry(['data1', 'data2']);
      SimulationManager.clearData();
      SimulationManager.toggleSimulation();
      clock.tick(1000 / SimulationManager.getTransmissionFrequency());
      expect(TelemetryData.emitPackets).to.have.callCount(0);
    });

    it('should log the data emitted', function () {
      SimulationManager.addDataEntry(['data1', 'data2']);
      SimulationManager.toggleSimulation();
      clock.tick(1000 / SimulationManager.getTransmissionFrequency());
      expect(Logger.data).to.have.callCount(1);
    });

    it('should emit data given a negative transmission frequency', function () {
      SimulationManager.setTransmissionFrequency(-5);
      SimulationManager.addDataEntry(['data1', 'data2']);
      SimulationManager.toggleSimulation();
      clock.tick(1000 / Math.abs(SimulationManager.getTransmissionFrequency()));
      expect(TelemetryData.emitPackets).to.have.been.callCount(1);
    });

    it('should emit data in the reversed order given negative transmission frequency', function () {
      SimulationManager.setTransmissionFrequency(-5);
      SimulationManager.addDataEntry(['data1', 'data2']);
      SimulationManager.addDataEntry(['data3', 'data4']);
      SimulationManager.addDataEntry(['data5', 'data6']);
      SimulationManager.toggleSimulation();
      clock.tick(1000 / Math.abs(SimulationManager.getTransmissionFrequency()));
      expect(TelemetryData.setCurrentStateFromString).to.have.been.calledWith('data1,data2');
      expect(TelemetryData.emitPackets).to.have.callCount(1);
      clock.tick(1000 / Math.abs(SimulationManager.getTransmissionFrequency()));
      expect(TelemetryData.setCurrentStateFromString).to.have.been.calledWith('data5,data6');
      expect(TelemetryData.emitPackets).to.have.callCount(2);
      clock.tick(1000 / Math.abs(SimulationManager.getTransmissionFrequency()));
      expect(TelemetryData.setCurrentStateFromString).to.have.been.calledWith('data3,data4');
      expect(TelemetryData.emitPackets).to.have.callCount(3);
    });

    it('should loop over data at the last data entry', function () {
      SimulationManager.addDataEntry(['data1', 'data2']);
      SimulationManager.toggleSimulation();
      clock.tick(2 * 1000 / SimulationManager.getTransmissionFrequency());
      expect(TelemetryData.setCurrentStateFromString).to.have.been.calledWith('data1,data2');
      expect(TelemetryData.emitPackets).to.have.callCount(2);
    });
  });

  describe('setTransmissionFrequency', function () {
    it('should set the transmission frequency given an positive integer input', function () {
      SimulationManager.setTransmissionFrequency(9);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(9);
    });

    it('should set the transmission frequency given a string integer input', function () {
      SimulationManager.setTransmissionFrequency('9');
      expect(SimulationManager.getTransmissionFrequency()).to.equal(9);
    });

    it('should set the transmission frequency given a negative integer input', function () {
      SimulationManager.setTransmissionFrequency(-9);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(-9);
    });

    it('should not set the transmission frequency given a null input', function () {
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency(null);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should not set the transmission frequency given an undefined input', function () {
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency(undefined);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should not set the transmission frequency given 0', function () {
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency(0);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should not set the transmission frequency given string 0', function () {
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency('0');
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should not set the transmission frequency given a floating point input', function () {
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency(9.69);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should not set the transmission frequency given a non-integer string input', function () {
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency('9.69');
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should toggle the simulation twice if a simulation is active', function () {
      SimulationManager.toggleSimulation();
      var toggle = SimulationManager.toggleSimulation;
      SimulationManager.toggleSimulation = sinon.spy();
      SimulationManager.setTransmissionFrequency(8);
      expect(SimulationManager.toggleSimulation).to.have.callCount(2);
      SimulationManager.toggleSimulation = toggle;
    });

    it('should not toggle the simulation is not active', function () {
      var toggle = SimulationManager.toggleSimulation;
      SimulationManager.toggleSimulation = sinon.spy();
      SimulationManager.setTransmissionFrequency(8);
      expect(SimulationManager.toggleSimulation).to.have.callCount(0);
      SimulationManager.toggleSimulation = toggle;
    });
  });

  describe('getDefaultSimulationFilePath', function () {
    it('should return a string path', function () {
      expect(SimulationManager.getSimulationFilePath()).to.be.a('string');
    });

    it('should set the simulation file path', function () {
      SimulationManager.setSimulationFilePath('some_path');
      expect(SimulationManager.getSimulationFilePath()).to.be.equal('some_path');
    });
  })
});