module.exports = function(chai){
  var sinonChai = require("sinon-chai");
  var jqueryChai = require("chai-jq");
  chai.use(sinonChai);
  chai.use(jqueryChai);
};