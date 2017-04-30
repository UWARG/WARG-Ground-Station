var PathManager = require('../map/PathManager');
var Logger = require('./Logger');
var electron = require('electron');
var fs = require('fs');
var dialog = electron.dialog;

var PathImporter = {
  import: function () {
    dialog.showOpenDialog({
      properties: ['openFile'],
      title: 'Import Path from file',
      buttonLabel: 'Import',
      filters: [
        {name: 'WARG Path File', extensions: ['path']},
        {name: 'All Files', extensions: ['*']}
      ]
    }, function (file_path) {
      if (!file_path) {
        Logger.debug('No path file selected');
        return;
      }
      file_path = file_path[0];

      fs.readFile(file_path, function (err, content) {
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
            Logger.info("Successfully imported path from " + file_path);
          } catch (e) {
            Logger.error("Could not import path file, bad file format: " + e);
          }
        }
      });
    }.bind(this));
  },
  export: function () {
    var str = JSON.stringify(PathManager.waypoints, null, 2);

    dialog.showSaveDialog({
      title: 'Save Path File',
      buttonLabel: 'Save Gains',
      filters: [
        {name: 'WARG Path File', extensions: ['path']}
      ]
    }, function (file_path) {
      if (!file_path) {
        Logger.debug('No path file selected');
        return;
      }
      fs.writeFile(file_path, str, function (err) {
        if (err) {
          Logger.error(`Error writing path file to ${file_path}. ${err.toString()}`);
        }
        Logger.debug(`Path file saved to ${file_path}`);
      });
    }.bind(this));
  }
};

module.exports = PathImporter;