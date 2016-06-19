var PathManager = require('../map/PathManager');
var fdialogs = require('node-webkit-fdialogs'); //https://www.npmjs.com/package/node-webkit-fdialogs
var Logger = require('./Logger');

var PathImporter = {
  import: function () {
    var dialog = new fdialogs.FDialog({
      type: 'open',
      accept: ['.path'],
      path: '~/Documents'
    });
    dialog.readFile(function (err, content, path) {
      if (err) {
        Logger.error('There was an error in reading the path file. Error: ' + err);
      }
      else {
        try {
          var object = JSON.parse(content, 2);
          PathManager.clearPath();
          for (var i = 0; i < object.length; i++) {
            PathManager.appendWaypoint(object[i]);
          }
        } catch (e) {
          Logger.info("Could not save, bad file format: " + e);
        }
      }
    });
  },
  export: function () {
    str = JSON.stringify(PathManager.waypoints, null, 2);
    buf = new Buffer(str);
    fdialogs.saveFile(buf, function (err, path) {
      if (err) {
        Logger.error('There was an error saving the path to : ' + path + ' Error: ' + err);
      }
      else {
        Logger.debug("Path saved succesfully to " + path);
      }
    });
  }
};

module.exports = PathImporter;