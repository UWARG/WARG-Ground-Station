var Template = require('../util/Template');
var ParentSettingsView = require('./ParentSettingsView');//the parent item view from which this one extends from

//the setting files from which to display
var network_config = require('../../config/network-config');
var remote = require('electron').remote;
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