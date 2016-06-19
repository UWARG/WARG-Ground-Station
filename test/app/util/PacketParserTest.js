var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../../../tests-config')(chai);

describe('PacketParser', function () {
  var PacketParser = rewire('../../../app/util/PacketParser');
  var Validator = {};
  var Logger = {};

  describe('checkForMissingHeaders', function(){
    var sandbox;
    beforeEach(function () {
      sandbox = sinon.sandbox.create()

      var PacketTypes = {
        'packetType1': {
          'header1': null,
          'header2': null
        },
        'packetType2': {
          'header3': null,
          'header4': null
        }
      };

      Logger = {
        warn: sandbox.spy()
      };

      PacketParser.__set__({
        'PacketTypes': PacketTypes,
        'Logger': Logger,
        'Validator': Validator
      });
    });

    afterEach(function(){
      sandbox.restore();
    });

    it('given a match between given and expected headers should not log anything', function(){
      PacketParser.checkForMissingHeaders(['header1', 'header2', 'header3', 'header4']);
      expect(Logger.warn).to.have.been.callCount(0);
    });

    it('given a missing expected header should warn user', function(){
      PacketParser.checkForMissingHeaders(['header1', 'header2', 'header3']);
      expect(Logger.warn).to.have.been.calledWith('Did not receive an expected header! Header: header4');
    });

    it('given an extra expected header should warn user', function(){
      PacketParser.checkForMissingHeaders(['header1', 'header2', 'header3', 'header3', 'header4', 'header3']);
      expect(Logger.warn).to.have.been.calledWith('Header: header3 was received more than once! Times: 3');
    });

    it('given an unexpected header should warn user', function(){
      PacketParser.checkForMissingHeaders(['header1', 'header2', 'header3', 'header4', 'unexpected_header']);
      expect(Logger.warn).to.have.been.calledWith('An unexpected header was received from the data relay. Header: unexpected_header');
    });
  });

  describe('parseData', function () {
    var PacketTypes = {};
    var sandbox = sinon.sandbox.create();

    var Logger = {
      error: sandbox.spy(),
      warn: sandbox.spy()
    };

    var Validator = {
      validator1: sandbox.stub(),
      validator2: sandbox.stub(),
      validator3: sandbox.stub(),
      validator4: sandbox.stub()
    };


    function getExpectedResult(value1, value2, value3, value4) {
      return {
        'packetType1': {
          'header1': value1,
          'header2': value2
        },
        'packetType2': {
          'header3': value3,
          'header4': value4
        }
      };
    }

    function setValidators(value1, value2, value3, value4) {
      PacketTypes = {
        'packetType1': {
          'header1': value1,
          'header2': value2
        },
        'packetType2': {
          'header3': value3,
          'header4': value4
        }
      };

      PacketParser.__set__({
        'PacketTypes': PacketTypes,
        'Logger': Logger,
        'Validator': Validator
      });
    }

    beforeEach(function () {
      PacketTypes = {
        'packetType1': {
          'header1': null,
          'header2': null
        },
        'packetType2': {
          'header3': null,
          'header4': null
        }
      };

      Validator.validator1.returns(true);
      Validator.validator2.returns(true);
      Validator.validator3.returns(true);
      Validator.validator4.returns(true);

      PacketParser.__set__({
        'PacketTypes': PacketTypes,
        'Logger': Logger,
        'Validator': Validator
      });
    });

    afterEach(function () {
      sinon.sandbox.restore();
    });

    it('given a larger data length than header length should warn user', function () {
      PacketParser.parseData('34, 34, 34', ['1', '2']);
      expect(Logger.error, 'Logger.error').to.have.calledWith('Number of data headers doesn\'t match the number of data! Length of data: 3 Length of headers: 2');
    });

    it('given a larger header length than data length should warn user', function () {
      PacketParser.parseData('34, 34', ['1', '2', '3']);
      expect(Logger.error, 'Logger.error').to.have.calledWith('Number of data headers doesn\'t match the number of data! Length of data: 2 Length of headers: 3');
    });

    it('given a header that does not exist in the expected packet types not include the header in the return', function () {
      var result = PacketParser.parseData('34, 34', ['unexpectedheader1', 'header2']);
      expect(result).to.eql(getExpectedResult(null, 34, null, null));
    });

    it('given a header that does not have a validator should perform a blind numeric conversion and return header value', function () {
      setValidators(null, null, null, null);
      var result = PacketParser.parseData('34, 35, 36, 37', ['header1', 'header2', 'header3', 'header4']);
      expect(result).to.deep.equal(getExpectedResult(34, 35, 36, 37));
    });

    it('given a data values with untrimmed spaces should successfully convert to numeric value for header', function () {
      var result = PacketParser.parseData('  34  ,   35  ,  36  ,  37 ', ['header1', 'header2', 'header3', 'header4']);
      expect(result).to.deep.equal(getExpectedResult(34, 35, 36, 37));
    });

    it('given a header that is not received should warn user and return null for the header value', function () {
      var result = PacketParser.parseData('34, 35, 36', ['header1', 'header2', 'header3']);
      expect(Logger.error).to.have.calledWith('Parsing Error. Value for header header4 not received');
      expect(result).to.eql(getExpectedResult(34, 35, 36, null));
    });

    it('given a header with a single validator that does not exist should throw error', function () {
      setValidators('validatorThatDoesNotExist', null, null, null);
      var result_function = PacketParser.parseData.bind(PacketParser, '34, 35, 36, 37', ['header1', 'header2', 'header3', 'header4']);
      expect(result_function).to.throw(Error, 'Validator function validatorThatDoesNotExist does not exist!');
    });

    it('given a header with a single validator should call the validator with the value', function () {
      setValidators('validator1', null, null, null);
      PacketParser.parseData('34, 35, 36, 85', ['header1', 'header2', 'header3, header4']);
      expect(Validator.validator1).to.have.been.calledWith('34');
    });

    it('given a header with a single validator that passes should return a numeric version for the header value', function () {
      setValidators('validator1', 'validator2', 'validator3', 'validator4');
      Validator.validator1.returns(true);
      var result = PacketParser.parseData('34, 35, 36, 85', ['header1', 'header2', 'header3', 'header4']);
      expect(result['packetType1']['header1']).to.equal(34);
    });

    it('given a header with a single validator that fails should warn user and return null for the header value', function () {
      setValidators('validator1', 'validator2', 'validator3', 'validator4');
      Validator.validator1.returns(false);
      var result = PacketParser.parseData('invalid_value, 35, 36, 85', ['header1', 'header2', 'header3', 'header4']);
      expect(Logger.warn, 'Logger.warn').to.have.been.calledWith('Validation failed for header1. Value: invalid_value');
      expect(result['packetType1']['header1']).to.equal(null);
    });

    it('given a header with multiple validators where one doesn\'t exist should throw error', function () {
      setValidators(['validator1', 'validatorThatDoesntExist'], 'validator2', 'validator3', 'validator4');
      var result_function = PacketParser.parseData.bind(PacketParser, '34, 35, 36, 37', ['header1', 'header2', 'header3', 'header4']);
      expect(result_function).to.throw(Error, 'Validator function validatorThatDoesntExist does not exist!');
    });

    it('given a header with multiple validators should run all validators with the header value', function () {
      setValidators(['validator1', 'validator2'], null, 'validator3', 'validator4');
      PacketParser.parseData('99,35,36,85', ['header1', 'header2', 'header3', 'header4']);
      expect(Validator.validator1).to.have.been.calledWithExactly('99');
      expect(Validator.validator2).to.have.been.calledWithExactly('99');
      expect(Validator.validator3).to.have.been.calledWithExactly('36');
      expect(Validator.validator4).to.have.been.calledWithExactly('85');
    });

    it('given a header with multiple validators that all pass should return a numeric version for the header value', function () {
      setValidators(['validator1', 'validator2'], null, 'validator3', 'validator4');
      var result = PacketParser.parseData('99,35,36,85', ['header1', 'header2', 'header3', 'header4']);
      expect(result['packetType1']['header1']).to.equal(99);
    });

    it('given a header with multiple validators where one fails should warn user and return null for the header value', function () {
      setValidators(['validator1', 'validator2'], null, 'validator3', 'validator4');
      Validator.validator2.returns(false);
      var result = PacketParser.parseData('99,35,36,85', ['header1', 'header2', 'header3', 'header4']);
      expect(Logger.warn, 'Logger.warn').to.have.been.calledWith('Validation failed for header1. Value: 99');
      expect(result['packetType1']['header1']).to.equal(null);
    });

    it('given a header with multiple validators where all fail should warn user and return null for the header value', function () {
      setValidators(['validator1', 'validator2'], null, 'validator3', 'validator4');
      Validator.validator2.returns(false);
      Validator.validator1.returns(false);
      var result = PacketParser.parseData('99,35,36,85', ['header1', 'header2', 'header3', 'header4']);
      expect(Logger.warn, 'Logger.warn').to.have.been.calledWith('Validation failed for header1. Value: 99');
      expect(result['packetType1']['header1']).to.equal(null);
    });
  });
});