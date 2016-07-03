var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var mockery = require("mockery");
var expect = chai.expect;
require('../../../tests-config')(chai);

var EventEmitter = require('events');
var RemoteRequire = require('../../helpers/RemoteRequire');
var FakeDom = require('../../helpers/FakeDom');

describe('SimulationModeView', function () {
  var SimulationModeView = {};
  var TelemetryData = {};
  var Logger = {};
  var PacketParser = {};
  var SimulationManager = {};
  var FastCSV = {};
  var remote = {};
  remote.dialog = {};
  var DOM_GLOBALS = {};

  before(function (done) {
    FakeDom.setup(function (dom_globals) {
      DOM_GLOBALS = dom_globals;
      done();
    });
  });

  beforeEach(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    SimulationManager.setSimulationFilePath = sinon.spy();
    SimulationManager.getSimulationFilePath = sinon.stub();
    SimulationManager.getSimulationFilePath.returns('file_path');
    SimulationManager.getTransmissionFrequency = sinon.stub();
    SimulationManager.getTransmissionFrequency.returns(5);
    SimulationManager.setTransmissionFrequency = sinon.spy();
    SimulationManager.toggleSimulation = sinon.spy();
    SimulationManager.isActive = sinon.stub();
    SimulationManager.isActive.returns(true);
    SimulationManager.clearData = sinon.spy();

    FastCSV.fromPath = sinon.stub();
    FastCSV.fromPath.returns({on: sinon.stub()})

    remote.require = RemoteRequire.configure({
      'TelemetryData': TelemetryData,
      'Logger': Logger,
      'PacketParser': PacketParser,
      'SimulationManager': SimulationManager
    });

    mockery.registerMock('electron', {
      remote: remote
    });
    mockery.registerMock('fast-csv', FastCSV);
    mockery.registerAllowable('../../../app/views/SimulationModeView');
    mockery.registerAllowable('../util/Template');

    SimulationModeView = new (require('../../../app/views/SimulationModeView')(DOM_GLOBALS.Marionette));
  });

  afterEach(function () {
    mockery.disable();
  });

  describe('onRender', function () {
    it('should display the current simulation file path', function () {
      SimulationModeView.render();
      expect(SimulationModeView.ui.file_path).to.have.$text('file_path');
    });

    it('should display the transmission frequency', function () {
      SimulationModeView.render();
      expect(SimulationModeView.ui.transmission_speed).to.have.$text('5');
    });

    it('should display stop simulation button if simulation active', function () {
      SimulationManager.isActive.returns(true);
      SimulationModeView.render();
      expect(SimulationModeView.ui.start_button).to.have.$text('Stop Simulation');
      expect(SimulationModeView.ui.start_button).to.have.$class('button-error');
      expect(SimulationModeView.ui.start_button).to.not.have.$class('button-success');
    });

    it('should display start simulation button if simulation not active', function () {
      SimulationManager.isActive.returns(false);
      SimulationModeView.render();
      expect(SimulationModeView.ui.start_button).to.have.$text('Start Simulation');
      expect(SimulationModeView.ui.start_button).to.have.$class('button-success');
      expect(SimulationModeView.ui.start_button).to.not.have.$class('button-error');
    });
  });

  describe('userInteractions', function () {
    it('sliding the slider should change transmission frequency', function () {
      SimulationManager.getTransmissionFrequency.returns(9);
      SimulationModeView.render();
      SimulationModeView.ui.change_speed_slider.val(9);
      SimulationModeView.ui.change_speed_slider.trigger('change');
      expect(SimulationManager.setTransmissionFrequency).to.have.been.calledWith('9');
      expect(SimulationModeView.ui.transmission_speed).to.have.$text('9');
    });

    it('if simulation not active, clicking on start button should start simulation', function () {
      SimulationManager.isActive.returns(false);
      SimulationModeView.render();
      SimulationModeView.ui.start_button.trigger('click');
      expect(SimulationManager.toggleSimulation).to.have.callCount(1);
      expect(SimulationModeView.ui.start_button).to.have.$text('Start Simulation');
      expect(SimulationModeView.ui.start_button).to.have.$class('button-success');
      expect(SimulationModeView.ui.start_button).to.not.have.$class('button-error');
    });

    it('if simulation not active, clicking on start button should start simulation', function () {
      SimulationManager.isActive.returns(true);
      SimulationModeView.render();
      SimulationModeView.ui.start_button.trigger('click');
      expect(SimulationManager.toggleSimulation).to.have.callCount(1);
      expect(SimulationModeView.ui.start_button).to.have.$text('Stop Simulation');
      expect(SimulationModeView.ui.start_button).to.have.$class('button-error');
      expect(SimulationModeView.ui.start_button).to.not.have.$class('button-success');
    });
  });

  describe('openSimulationFile', function () {
    it('clicking on open file button should open up file dialog window', function(){
      SimulationModeView.render();
      remote.dialog.showOpenDialog = sinon.spy();
      SimulationModeView.$el.find('#select-new-file-button').trigger('click');
      expect(remote.dialog.showOpenDialog).to.have.callCount(1);
    });

    it('given empty file path should warn user', function(){
      Logger.debug = sinon.spy();
      SimulationModeView.render();
      remote.dialog.showOpenDialog = function(options, callback){
        callback(null);
      };
      SimulationModeView.$el.find('#select-new-file-button').trigger('click');
      expect(Logger.debug).to.have.been.calledWith('No simulation file selected');
    });

    it('given valid file should display new file path and set it in Simulation Manager', function(){
      SimulationModeView.render();
      remote.dialog.showOpenDialog = function(options, callback){
        callback(['file_path']);
      };
      SimulationModeView.$el.find('#select-new-file-button').trigger('click');
      expect(SimulationModeView.ui.file_path).to.have.$text('file_path');
      expect(SimulationManager.setSimulationFilePath).to.have.been.calledWith('file_path');
    });
  });

  describe('parseSimulationFile', function(){
    var headers = ['header1','header2'];

    function trigger(){
      SimulationModeView.$el.find('#select-new-file-button').trigger('click');
    }
    beforeEach(function(){
      SimulationModeView.render();
      SimulationManager.clearData = sinon.spy();
      SimulationManager.addDataEntry = sinon.spy();
      TelemetryData.getHeaders = sinon.stub();
      TelemetryData.getHeaders.returns(headers);
      TelemetryData.setHeaders = sinon.spy();
      Logger.debug = sinon.spy();
      PacketParser.checkForMissingHeaders = sinon.spy();
      remote.dialog.showOpenDialog = function(options, callback){
        callback(['file_path']);
      };
    });

    it('should clear data on the SimulationManager', function(){
      trigger();
      expect(SimulationManager.clearData).to.have.callCount(1);
    });

    it('should set TelemetryData headers on first line', function(){
      var emitter = new EventEmitter();
      FastCSV.fromPath = function(path, options){
        return emitter;
      };
      trigger();
      emitter.emit('data', headers);
      expect(TelemetryData.setHeaders).to.have.been.calledWith(headers);
      expect(PacketParser.checkForMissingHeaders).to.have.been.calledWith(headers);
    });

    it('should add data entries to SimulationManager on subsequent lines', function(){
      var emitter = new EventEmitter();
      FastCSV.fromPath = function(path, options){
        return emitter;
      };
      trigger();
      emitter.emit('data', headers);
      emitter.emit('data', 'data1');
      expect(SimulationManager.addDataEntry).to.have.been.calledWith('data1');
      emitter.emit('data', 'data2');
      expect(SimulationManager.addDataEntry).to.have.been.calledWith('data2');
    });
  });
});