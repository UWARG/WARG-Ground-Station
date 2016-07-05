var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../../../tests-config')(chai);

describe('TelemetryData', function () {
  var Commands = rewire('../../../app/models/Commands');
  var NetworkManager = {};
  var Logger = {};
  var SimulationManager = {};

  beforeEach(function(){
    Commands.__set__({
      'NetworkManager' : NetworkManager,
      'Logger' : Logger,
      'SimulationManager' : SimulationManager
    });
  });

  describe('checkConnection', function(){
    it('should return false if simulator is running and connection is disconnected', function(){

    });

    it('should return false if simulator is running and connection is connected', function(){

    });

    it('should return true if simulator is not running and connection is connected', function(){

    });

    it('should return false and warn user if simulator isnt running and connection doesnt exist', function(){

    });
  });

  describe('sendProtectedCommand', function(){
    it('should write command to the connection with the command password if connection exists and return true', function(){

    });

    it('should inform user that the command is sent if simulation is active and return true', function(){

    });

    it('return false if connection doesnt exist', function(){

    });
    it('should return false and not write to connection if blank value given as command', function(){

    });
  });

  describe('sendCommand', function(){
    it('should write command with correct value if connection exists and single value given', function(){

    });

    it('should write command with values delimitted by commas if connection exists and multiple values given', function(){

    });

    it('should return false and not write to connection if blank value given as command', function(){

    });

    it('should return false and not write to connection if blank value given as value', function(){

    });

    it('should return false and not write to connection if blank value given as one of the multiple value', function(){

    });

    it('should inform user that the command is sent if simulation is active and return true', function(){

    });

    it('return false if connection doesnt exist', function(){

    });
  });

  describe('sendRawCommand', function(){
    it('should write command to the connection if connection exists and return true', function(){

    });

    it('should inform user that the command is sent if simulation is active and return true', function(){

    });

    it('return false if connection doesnt exist', function(){

    });

    it('should return false and not write to connection if blank value given as command', function(){

    });
  });

});