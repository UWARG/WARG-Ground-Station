var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../../../tests-config')(chai);

describe('TelemetryData', function () {
  var TelemetryData = require('../../../app/models/TelemetryData');

  afterEach(function(){
    TelemetryData.headers = [];
    TelemetryData.removeAllListeners();
  });

  describe('setHeadersFromString', function(){
    it('given a valid string of headers should set the headers array correctly', function(){
      var string = 'header1,header2,header3,header4';
      TelemetryData.setHeadersFromString(string);
      var expected_array  = ['header1', 'header2', 'header3', 'header4'];
      expect(TelemetryData.headers).to.eql(expected_array);
    });

    it('given a string with spaces should set the headers array correctly', function(){
      var string = '   header1 , header2 ,         header3 , header4';
      TelemetryData.setHeadersFromString(string);
      var expected_array  = ['header1', 'header2', 'header3', 'header4'];
      expect(TelemetryData.headers).to.eql(expected_array);
    });

    it('given a string with a single header should set the headers array correctly', function(){
      var string = 'header1';
      TelemetryData.setHeadersFromString(string);
      var expected_array  = ['header1'];
      expect(TelemetryData.headers).to.eql(expected_array);
    });

    it('given an empty string should set the headers array as an empty array', function(){
      TelemetryData.setHeadersFromString('');
      var expected_array  = [];
      expect(TelemetryData.headers).to.eql(expected_array);
    });

    it('given null should set the headers array as an empty array', function(){
      TelemetryData.setHeadersFromString(null);
      var expected_array  = [];
      expect(TelemetryData.headers).to.eql(expected_array);
    });

    it('given undefined should set the headers array as an empty array', function(){
      var result = TelemetryData.setHeadersFromString(undefined);
      var expected_array  = [];
      expect(TelemetryData.headers).to.eql(expected_array);
    });
  });

  describe('emitPackets', function(){
    it('given a valid packets object should emit the events with the correct payload', function(){
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

      TelemetryData.on('packet_name1', callbacks.packet_name1);
      TelemetryData.on('packet_name2', callbacks.packet_name2);

      TelemetryData.emitPackets(packet_object);

      expect(callbacks.packet_name1).to.have.been.calledWithExactly(packet_object['packet_name1']);
      expect(callbacks.packet_name2).to.have.been.calledWithExactly(packet_object['packet_name2']);
    });

    it('given a packet object with a single packet should emit the event with the correct payload', function(){
      var packet_object = {
        packet_name1: {
          packet_header1: 'packet_value1',
          packet_header2: 'packet_value2'
        }
      };

      var callback = sinon.spy();
      TelemetryData.on('packet_name1', callback);
      TelemetryData.emitPackets(packet_object);

      expect(callback).to.have.been.calledWithExactly(packet_object['packet_name1']);
    });

    it('given an empty object should not emit any events', function(){
      var original_emitter = TelemetryData.emit;
      TelemetryData.emit = sinon.spy();

      TelemetryData.emitPackets({});
      expect(TelemetryData.emit).to.have.callCount(0);
      TelemetryData.emit = original_emitter;
    });

    it('given null should not emit any events', function(){
      var original_emitter = TelemetryData.emit;
      TelemetryData.emit = sinon.spy();

      TelemetryData.emitPackets(null);
      expect(TelemetryData.emit).to.have.callCount(0);
      TelemetryData.emit = original_emitter;
    });

    it('given undefined should not emit any events', function(){
      var original_emitter = TelemetryData.emit;
      TelemetryData.emit = sinon.spy();

      TelemetryData.emitPackets(undefined);
      expect(TelemetryData.emit).to.have.callCount(0);
      TelemetryData.emit = original_emitter;
    });
  });
});