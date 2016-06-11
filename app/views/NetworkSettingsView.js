/**
 * @author Serge Babayan
 * @module views/NetworkSettingsView
 * @requires util/Template
 * @requires views/ParentSettingsView
 * @requires config/network-config
 * @requires connections/DataRelay
 * @requires electron
 * @extends views/ParentSettingsView
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for displaying configurable settings for the data relay connection
 */

var Template = require('../util/Template');
var ParentSettingsView = require('./ParentSettingsView');
var remote = require('electron').remote;
var network_config = remote.require('./config/network-config');
var DataRelay = remote.require('./app/connections/DataRelay');

module.exports = function (Marionette, $) {
  return ParentSettingsView(Marionette, $).extend({
    template: Template('NetworkSettingsView'),

    ui: {
      app_settings: '.app-settings',
      save_button: '.save-button',
      discard_button: '.discard-button',
      error_message: '.error-message-box'
    },

    events: {
      "click .save-button": 'saveSettings',
      "click .discard-button": 'discardChanges',
      "click .reset-default-button": 'resetSettingsToDefault',
      "change .app-settings input": 'enableSaveDiscardButton',
      "click .reconnect-all-button": 'reconnectAll'
    },

    onRender: function () {
      this.addSettings(network_config);
    },

    reconnectAll: function () {
      DataRelay.init(); //restart the data relay connection
    }
  });
};