var _ = require('underscore');

module.exports.configure = function(configuration){
  return function(require_path){
    return _.find(configuration, function(object, module_name){
      if(require_path.includes(module_name)){
        return object;
      }
    });
  }
};