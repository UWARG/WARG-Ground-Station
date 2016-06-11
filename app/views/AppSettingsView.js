/**
 * @author Serge Babayan
 * @module views/AppSettingsView
 * @requires util/Template
 * @requires views/ParentSettingsView
 * @requires config/advanced-config
 * @requires config/application-config
 * @requires config/map-config
 * @requires config/picpilot-config
 * @requires electron
 * @extends views/ParentSettingsView
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible general app settings
 */

var Template = require('../util/Template');
var ParentSettingsView = require('./ParentSettingsView');
var remote = require('electron').remote;

//the setting files to display
var advanced_config = remote.require('./config/advanced-config');
var app_config = remote.require('./config/application-config');
var map_config = remote.require('./config/map-config');
var picpilot_config = remote.require('./config/picpilot-config');

module.exports = function (Marionette, $) {
  return ParentSettingsView(Marionette, $).extend({
    template: Template('AppSettingsView'),

    onRender: function () {
      this.ui.app_settings.append('<h2>Advanced Settings</h2>');
      this.addSettings(advanced_config);
      this.ui.app_settings.append('<h2>Application Settings</h2>');
      this.addSettings(app_config);
      this.ui.app_settings.append('<h2>Map Settings</h2>');
      this.addSettings(map_config);
      this.ui.app_settings.append('<h2>Picpilot Settings</h2>');
      this.addSettings(picpilot_config);
    }
  });
};