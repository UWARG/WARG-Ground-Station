var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../../../tests-config')(chai);

describe('TelemetryData', function () {
  var TelemetryData = rewire('../../../app/models/TelemetryData');
  var PacketParser = {};

  beforeEach(function () {
    PacketParser.parseData = sinon.stub();
    TelemetryData.__set__({
      'PacketParser': PacketParser
    });
  });

  afterEach(function () {
    TelemetryData.clearHeaders();
    TelemetryData.setCurrentState({});
    TelemetryData.removeAllListeners();
  });

  describe('settersAndGetters', function () {
    it('setHeaders should set headers', function () {
      TelemetryData.setHeaders(['header1', 'header2']);
      expect(TelemetryData.getHeaders()).to.be.eql(['header1', 'header2']);
    });

    it('setHeaders should set headers', function () {
      var packet = {
        packet_name: {
          header: 'value'
        }
      };
      TelemetryData.setCurrentState(packet);
      expect(TelemetryData.getCurrentState()).to.be.eql(packet);
    });
  });

  describe('setCurrentStateFromString', function () {
    it('should set the current state based on the results for packet parser', function () {
      var headers = ['header'];
      var state_string = 'value';
      var current_state = {
        packet_name: {
          header: 'value'
        }
      };

      TelemetryData.setHeaders(headers);
      PacketParser.parseData.returns(current_state);

      TelemetryData.setCurrentStateFromString(state_string);
      expect(PacketParser.parseData).to.have.been.calledWith(state_string);
      expect(TelemetryData.getCurrentState()).to.be.eql(current_state);
    });
  });

  describe('setHeadersFromString', function () {
    it('given a valid string of headers should set the headers array correctly', function () {
      var string = 'header1,header2,header3,header4';
      TelemetryData.setHeadersFromString(string);
      var expected_array = ['header1', 'header2', 'header3', 'header4'];
      expect(TelemetryData.getHeaders()).to.eql(expected_array);
    });

    it('given a string with spaces should set the headers array correctly', function () {
      var string = '   header1 , header2 ,         header3 , header4';
      TelemetryData.setHeadersFromString(string);
      var expected_array = ['header1', 'header2', 'header3', 'header4'];
      expect(TelemetryData.getHeaders()).to.eql(expected_array);
    });

    it('given a string with a single header should set the headers array correctly', function () {
      var string = 'header1';
      TelemetryData.setHeadersFromString(string);
      var expected_array = ['header1'];
      expect(TelemetryData.getHeaders()).to.eql(expected_array);
    });

    it('given an empty string should set the headers array as an empty array', function () {
      TelemetryData.setHeadersFromString('');
      var expected_array = [];
      expect(TelemetryData.getHeaders()).to.eql(expected_array);
    });

    it('given null should set the headers array as an empty array', function () {
      TelemetryData.setHeadersFromString(null);
      var expected_array = [];
      expect(TelemetryData.getHeaders()).to.eql(expected_array);
    });

    it('given undefined should set the headers array as an empty array', function () {
      var result = TelemetryData.setHeadersFromString(undefined);
      var expected_array = [];
      expect(TelemetryData.getHeaders()).to.eql(expected_array);
    });
  });

  describe('emitPackets', function () {
    it('given a valid packets object should emit the events with the correct payload', function () {
      var packet_object = {
        packet_name1: {
          packet_header1: 'packet_value1',
          packet_header2: 'packet_value2'
        },
        packet_name2: {
          packet_header3: 'packet_value3',
          packet_header4: 'packet_value4'
        }
      };

      var callbacks = {
        packet_name1: sinon.spy(),
        packet_name2: sinon.spy()
      };

      TelemetryData.setCurrentState(packet_object);
      TelemetryData.on('packet_name1', callbacks.packet_name1);
      TelemetryData.on('packet_name2', callbacks.packet_name2);

      TelemetryData.emitPackets();

      expect(callbacks.packet_name1).to.have.been.calledWithExactly(packet_object['packet_name1']);
      expect(callbacks.packet_name2).to.have.been.calledWithExactly(packet_object['packet_name2']);
    });

    it('given a packet object with a single packet should emit the event with the correct payload', function () {
      var packet_object = {
        packet_name1: {
          packet_header1: 'packet_value1',
          packet_header2: 'packet_value2'
        }
      };

      var callback = sinon.spy();
      TelemetryData.setCurrentState(packet_object);
      TelemetryData.on('packet_name1', callback);
      TelemetryData.emitPackets();

      expect(callback).to.have.been.calledWithExactly(packet_object['packet_name1']);
    });

    it('given an empty object should not emit any events', function () {
      var original_emitter = TelemetryData.emit;
      TelemetryData.emit = sinon.spy();
      TelemetryData.setCurrentState({});
      TelemetryData.emitPackets();
      expect(TelemetryData.emit).to.have.callCount(0);
      TelemetryData.emit = original_emitter;
    });
  });

  describe('DataReceivedHistory', function () {
    var example_packet1 = [1, 5, 6, 3, 2, 5, 3.23, 54, 3, 5];
    var example_packet2 = [5, 6, 4, 3, 4, 5, 67, 234, 4, 56, 4, 3];

    beforeEach(function(){
      TelemetryData.clearDataReceivedHistory();
    });
    
    it('should add a data packet to the received history', function () {
      TelemetryData.addDataReceivedHistory(example_packet1);
      expect(TelemetryData.getDataReceivedHistory()).to.eql([example_packet1]);
    });

    it('should add multiple data packets to the received history, with the most recent one being the first one', function () {
      TelemetryData.addDataReceivedHistory(example_packet1);
      TelemetryData.addDataReceivedHistory(example_packet2);
      expect(TelemetryData.getDataReceivedHistory()).to.eql([example_packet1, example_packet2]);
    });

    it('should successfully clear all the data packets if clear is called', function () {
      TelemetryData.addDataReceivedHistory(example_packet1);
      TelemetryData.addDataReceivedHistory(example_packet2);
      TelemetryData.clearDataReceivedHistory();
      expect(TelemetryData.getDataReceivedHistory()).to.eql([]);
    });

    it('should successfully clear all the data packets even if received history is empty in the first place', function () {
      TelemetryData.clearDataReceivedHistory();
      expect(TelemetryData.getDataReceivedHistory()).to.eql([]);
    });
  });
});