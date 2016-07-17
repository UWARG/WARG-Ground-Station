/**
 * @author Serge Babayan
 * @module util/GainsImporter
 * @requires util/Logger
 * @requires config/gains-config
 * @requires fs
 * @requires electron.dialog
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Contains logic for importing and exporting gain files
 **/

var electron = require('electron');
var fs = require('fs');
var dialog = electron.dialog;
var Logger = require('../util/Logger');
var gains_config = require('../../config/gains-config');

var GainsImporter = {
  /**
   * Exports the saved PID gains into a file. Shows a file dialog window for the user to select a file location.
   * @function export
   */
  export: function () {
    var keys = Object.keys(gains_config.default_settings);
    var stringifiedGains;
    var exported_settings = gains_config.default_settings;
    for (var i = 0; i < keys.length; i++) {
      exported_settings[keys[i]] = gains_config.get(keys[i]);
    }
    stringifiedGains = JSON.stringify(exported_settings, null, 2);

    dialog.showSaveDialog({
      title: 'Save PID Gains File',
      buttonLabel: 'Save Gains',
      filters: [
        {name: 'PID Gains File', extensions: ['gains']}
      ]
    }, function (file_path) {
      if (!file_path) {
        Logger.debug('No PID Gain file selected');
        return;
      }
      fs.writeFile(file_path, stringifiedGains, function (err) {
        if (err) {
          Logger.error(`Error writing PID gain file to ${file_path}. ${err.toString()}`);
        }
        Logger.debug(`PID gain file saved to ${file_path}`);
      });
    }.bind(this));
  },

  /**
   * Imports a gain file and persists it within the app settings. Shows a file dialog window for the user to select a file
   * @function import
   */
  import: function () {
    dialog.showOpenDialog({
      properties: ['openFile'],
      title: 'Import PID Gains File',
      buttonLabel: 'Import',
      filters: [
        {name: 'PID Gains File', extensions: ['gains']},
        {name: 'All Files', extensions: ['*']}
      ]
    }, function (file_path) {
      if (!file_path) {
        Logger.debug('No PID Gain file selected');
        return;
      }
      file_path = file_path[0];

      fs.readFile(file_path, function (err, content) {
        if (err) {
          Logger.error('There was an error in reading the gains file. Error: ' + err);
        }
        else {
          var keys = Object.keys(gains_config.default_settings);
          try {
            var object = JSON.parse(content, 2);
            for (var i = 0; i < keys.length; i++) {
              if (keys[i] in object) {
                gains_config.set(keys[i], object[keys[i]]);
              }
            }
            Logger.info("Successfully imported gains from " + file_path);
          } catch (e) {
            Logger.error("Could not import PID gain file, bad file format: " + e);
          }
        }
      });
    }.bind(this));
  }
};

module.exports = GainsImporter;