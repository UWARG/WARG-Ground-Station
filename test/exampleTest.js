var chai = require("chai");
var sinon = require("sinon");
var rewire = require("rewire");
var expect = chai.expect;
require('../tests-config')(chai);

describe('This is an example test', function () {
  describe('A subset of this test', function () {
    it('should pass this test', function () {
      expect(2).to.eql(2);
    });
  });
});