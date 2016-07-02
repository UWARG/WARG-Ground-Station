var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../../../tests-config')(chai);

describe('SimulationManager', function () {
  var SimulationManager ={};
  var TelemetryData = {};
  var Logger = {};
  var Network = {};
  var PacketParser = {};
  var StatusManager = {};
  var clock;
  var sample_packet = {
    packet1: {
      header1: 'some_data1',
      header2: 'some_data2'
    }
  };
  var sample_packet2 = {
    packet2: {
      header3: 'some_data3',
      header4: 'some_data4'
    }
  };

  beforeEach(function(){
    clock = sinon.useFakeTimers();
    SimulationManager = rewire('../../../app/managers/SimulationManager');
    TelemetryData.current_state = {};
    TelemetryData.emitPackets = sinon.spy();
    TelemetryData.clearHeaders = sinon.spy();
    TelemetryData.headers = ['header1', 'header2'];
    Network.disconnectAll = sinon.spy();
    StatusManager.setStatusCode = sinon.spy();
    SimulationManager.simulation_active = false;
    PacketParser.parseData = sinon.stub();
    Logger.data = sinon.spy();


    SimulationManager.__set__({
      'TelemetryData' : TelemetryData,
      'Logger' : Logger,
      'Network' : Network,
      'PacketParser' : PacketParser,
      'StatusManager' : StatusManager
    });

    SimulationManager.clearData();
    if(SimulationManager.isActive()){
      SimulationManager.toggleSimulation();
    }
  });

  afterEach(function(){
    clock.restore();
  });

  describe('toggleSimulation', function(){
    it('should set the simulation status to true if was false before', function(){
      SimulationManager.toggleSimulation();
      expect(SimulationManager.isActive()).to.equal(true);
    });

    it('should set the simulation status to false if was true before', function(){
      SimulationManager.toggleSimulation();
      SimulationManager.toggleSimulation();
      expect(SimulationManager.isActive()).to.equal(false);
    });

    it('should set the appropriate status code when a simulation is started', function(){
      SimulationManager.toggleSimulation();
      expect(StatusManager.setStatusCode).to.have.been.calledWith('SIMULATION_ACTIVE', true);
    });

    it('should set the appropriate status code when a simulation has stopped', function(){
      SimulationManager.toggleSimulation();
      SimulationManager.toggleSimulation();
      expect(StatusManager.setStatusCode).to.have.been.calledWith('SIMULATION_ACTIVE', false);
    });

    it('should disconnect all network connections on a simulation start', function(){
      SimulationManager.toggleSimulation();
      expect(Network.disconnectAll).to.have.callCount(1);
    });

    it('should emit data packet at the correct frequency when a data entry is added and simulation started', function(){
      PacketParser.parseData.returns(sample_packet);
      SimulationManager.addDataEntry(['data1','data2']);
      SimulationManager.toggleSimulation();
      clock.tick(1000/SimulationManager.getTransmissionFrequency());
      expect(PacketParser.parseData).to.have.been.calledWith('data1,data2', TelemetryData.headers);
      expect(TelemetryData.emitPackets).to.have.been.calledWith(sample_packet);
    });

    it('should emit multiple data packets in order at the correct frequency when multiple data entries added and simulation started', function(){
      PacketParser.parseData.returns(sample_packet);
      SimulationManager.addDataEntry(['data1','data2']);
      SimulationManager.addDataEntry(['data3','data4']);
      SimulationManager.toggleSimulation();
      clock.tick(1000/SimulationManager.getTransmissionFrequency());
      expect(PacketParser.parseData).to.have.been.calledWith('data1,data2', TelemetryData.headers);
      expect(TelemetryData.emitPackets).to.have.been.calledWith(sample_packet);
      PacketParser.parseData.returns(sample_packet2);
      clock.tick(1000/SimulationManager.getTransmissionFrequency());
      expect(PacketParser.parseData).to.have.been.calledWith('data3,data4', TelemetryData.headers);
      expect(TelemetryData.emitPackets).to.have.been.calledWith(sample_packet2);
    });

    it('should not emit any data if there is no data and the simulation is started', function(){
      SimulationManager.toggleSimulation();
      clock.tick(1000/SimulationManager.getTransmissionFrequency());
      expect(PacketParser.parseData).to.have.callCount(0);
      expect(TelemetryData.emitPackets).to.have.callCount(0);
    });

    it('should not emit any data if clearData was called after added data entries and simulation is started', function(){
      SimulationManager.addDataEntry(['data1','data2']);
      SimulationManager.clearData();
      SimulationManager.toggleSimulation();
      clock.tick(1000/SimulationManager.getTransmissionFrequency());
      expect(PacketParser.parseData).to.have.callCount(0);
      expect(TelemetryData.emitPackets).to.have.callCount(0);
    });

    it('should log the data emitted', function(){
      PacketParser.parseData.returns(sample_packet);
      SimulationManager.addDataEntry(['data1','data2']);
      SimulationManager.toggleSimulation();
      clock.tick(1000/SimulationManager.getTransmissionFrequency());
      expect(Logger.data).to.have.callCount(1);
    });

    it('should emit data in given a negative transmission frequency', function(){
      SimulationManager.setTransmissionFrequency(-5);
      PacketParser.parseData.returns(sample_packet);
      SimulationManager.addDataEntry(['data1','data2']);
      SimulationManager.toggleSimulation();
      clock.tick(1000/Math.abs(SimulationManager.getTransmissionFrequency()));
      expect(PacketParser.parseData).to.have.been.calledWith('data1,data2', TelemetryData.headers);
      expect(TelemetryData.emitPackets).to.have.been.calledWith(sample_packet);
    });

    it('should emit data in the reversed order given negative transmission frequency', function(){
      SimulationManager.setTransmissionFrequency(-5);
      PacketParser.parseData.returns(sample_packet);
      SimulationManager.addDataEntry(['data1','data2']);
      SimulationManager.addDataEntry(['data3','data4']);
      SimulationManager.addDataEntry(['data5','data6']);
      SimulationManager.toggleSimulation();
      clock.tick(1000/Math.abs(SimulationManager.getTransmissionFrequency()));
      expect(PacketParser.parseData).to.have.been.calledWith('data1,data2', TelemetryData.headers);
      expect(TelemetryData.emitPackets).to.have.been.calledWith(sample_packet);
      PacketParser.parseData.returns(sample_packet2);
      clock.tick(1000/Math.abs(SimulationManager.getTransmissionFrequency()));
      expect(PacketParser.parseData).to.have.been.calledWith('data5,data6', TelemetryData.headers);
      expect(TelemetryData.emitPackets).to.have.been.calledWith(sample_packet2);
      PacketParser.parseData.returns(sample_packet);
      clock.tick(1000/Math.abs(SimulationManager.getTransmissionFrequency()));
      expect(PacketParser.parseData).to.have.been.calledWith('data3,data4', TelemetryData.headers);
      expect(TelemetryData.emitPackets).to.have.been.calledWith(sample_packet);
    });

    it('should loop over data at the last data entry', function(){
      PacketParser.parseData.returns(sample_packet);
      SimulationManager.addDataEntry(['data1','data2']);
      SimulationManager.toggleSimulation();
      clock.tick(2*1000/SimulationManager.getTransmissionFrequency());
      expect(PacketParser.parseData).to.have.been.calledWith('data1,data2', TelemetryData.headers);
      expect(TelemetryData.emitPackets).to.have.been.calledWith(sample_packet);
    });
  });

  describe('setTransmissionFrequency', function(){
    it('should set the transmission frequency given an positive integer input', function(){
      SimulationManager.setTransmissionFrequency(9);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(9);
    });

    it('should set the transmission frequency given a string integer input', function(){
      SimulationManager.setTransmissionFrequency('9');
      expect(SimulationManager.getTransmissionFrequency()).to.equal(9);
    });

    it('should set the transmission frequency given a negative integer input', function(){
      SimulationManager.setTransmissionFrequency(-9);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(-9);
    });

    it('should not set the transmission frequency given a null input', function(){
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency(null);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should not set the transmission frequency given an undefined input', function(){
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency(undefined);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should not set the transmission frequency given 0', function(){
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency(0);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should not set the transmission frequency given a floating point input', function(){
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency(9.69);
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should not set the transmission frequency given a non-integer string input', function(){
      SimulationManager.setTransmissionFrequency(4);
      SimulationManager.setTransmissionFrequency('9.69');
      expect(SimulationManager.getTransmissionFrequency()).to.equal(4);
    });

    it('should toggle the simulation twice if a simulation is active', function(){
      SimulationManager.toggleSimulation();
      var toggle = SimulationManager.toggleSimulation;
      SimulationManager.toggleSimulation = sinon.spy();
      SimulationManager.setTransmissionFrequency(8);
      expect(SimulationManager.toggleSimulation).to.have.callCount(2);
      SimulationManager.toggleSimulation = toggle;
    });

    it('should not toggle the simulation is not active', function(){
      var toggle = SimulationManager.toggleSimulation;
      SimulationManager.toggleSimulation = sinon.spy();
      SimulationManager.setTransmissionFrequency(8);
      expect(SimulationManager.toggleSimulation).to.have.callCount(0);
      SimulationManager.toggleSimulation = toggle;
    });
  });

  describe('getDefaultSimulationFilePath', function(){
    it('should return a string path', function(){
      expect(SimulationManager.getSimulationFilePath()).to.be.a('string');
    });
  })
});