var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../../../tests-config')(chai);

var Connection = require('../../../app/models/Connection');

describe('NetworkManager', function () {
  var NetworkManager = {};
  var Connection = {};
  var connection_instance = {};
  var connection_name = 'test_name';
  var connection_host = 'connection_host';
  var connection_port = '4044';

  function addConnection(){
    NetworkManager.addConnection(connection_name, connection_host, connection_port);
  }

  beforeEach(function () {
    connection_instance.connect = sinon.spy();
    connection_instance.disconnect = sinon.spy();
    connection_instance.destroy = sinon.spy();

    Connection = sinon.spy(function () {
      return connection_instance;
    });

    NetworkManager = rewire('../../../app/managers/NetworkManager');
    NetworkManager.__set__({
      'Connection': Connection
    });
  });

  describe('addConnection', function () {
    it('should create the correct parameters', function () {
      addConnection();
      expect(Connection).to.have.been.calledWith({
        name: connection_name,
        host: connection_host,
        port: connection_port
      });
    });

    it('should attempt to connect the connection', function () {
      addConnection();
      expect(connection_instance.connect).to.have.callCount(1);
    });

    it('should overwrite any existing connections with the same key', function () {
      addConnection();
      var different_connection_instance = {
        connect: function () {
        }
      };
      Connection = function () {
        return different_connection_instance;
      };
      NetworkManager.__set__({
        'Connection': Connection
      });
      addConnection();
      expect(NetworkManager.getConnectionByName(connection_name)).to.be.eql(different_connection_instance);
    });
  });

  describe('getConnectionByKey', function () {
    it('should return the connection object given a valid key', function () {
      addConnection();
      expect(NetworkManager.getConnectionByName(connection_name)).to.equal(connection_instance);
    });

    it('should return null if the connection doesn\'t exist', function () {
      expect(NetworkManager.getConnectionByName('ewfewfwef')).to.equal(null);
    });
  });

  describe('disconnectAllConnections', function () {
    it('should call a disconnect method on every connection', function () {
      var connection_instance2 = {};
      connection_instance2.connect = sinon.spy();
      connection_instance2.disconnect = sinon.spy();
      addConnection();
      Connection = function () {
        return connection_instance2;
      };
      NetworkManager.__set__({
        'Connection': Connection
      });
      NetworkManager.addConnection('different_name', connection_host, connection_port);
      NetworkManager.disconnectAllConnections();
      expect(connection_instance.disconnect).to.have.callCount(1);
      expect(connection_instance2.disconnect).to.have.callCount(1);
    });

    it('should call a disconnect if theres only one connection', function () {
      addConnection();
      NetworkManager.disconnectAllConnections();
      expect(connection_instance.disconnect).to.have.callCount(1);
    });
  });

  describe('removeAllConnections', function () {
    it('should call a destroy method on every connection', function () {
      var connection_instance2 = {};
      connection_instance2.connect = sinon.spy();
      connection_instance2.destroy = sinon.spy();
      addConnection();
      Connection = function () {
        return connection_instance2;
      };
      NetworkManager.__set__({
        'Connection': Connection
      });
      NetworkManager.addConnection('different_name', connection_host, connection_port);
      NetworkManager.removeAllConnections();
      expect(connection_instance.destroy).to.have.callCount(1);
      expect(connection_instance2.destroy).to.have.callCount(1);
    });

    it('should call a disconnect if theres only one connection', function () {
      addConnection();
      NetworkManager.removeAllConnections();
      expect(connection_instance.destroy).to.have.callCount(1);
    });
  });

  describe('removeConnection', function () {
    it('should call destroy on the connection', function () {
      addConnection();
      NetworkManager.removeConnection(connection_name);
      expect(connection_instance.destroy).to.have.callCount(1);
    });

    it('should delete the connection key from storage', function () {
      addConnection();
      NetworkManager.removeConnection(connection_name);
      expect(NetworkManager.getConnectionByName(connection_name)).to.be.equal(null);
    });

    it('should do nothing if the connection doesnt exist', function () {
      NetworkManager.removeConnection('someconnection');
      expect(NetworkManager.getConnectionByName('someconnection')).to.be.equal(null);
    });
  });
});