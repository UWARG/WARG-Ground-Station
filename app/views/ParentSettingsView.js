/**
 * @author Serge Babayan
 * @module views/ParentSettingsView
 * @requires util/Validator
 * @requires underscore
 * @requires electron
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Master settings view from which the AppSettingsView and NetworkSettingsView inherit off of
 */

var _ = require('underscore');
var Template = require('../util/Template');
var Validator = require('../util/Validator');

module.exports = function (Marionette, $) {
  return Marionette.ItemView.extend({
    template: Template('AppSettingsView'), //you should override this
    className: 'settingsView', //no need to override this

    //you should add onto this if you have more elements
    ui: {
      app_settings: '.app-settings',
      save_button: '.save-button',
      discard_button: '.discard-button',
      error_message: '.error-message-box'
    },

    //you should add onto this if you need more events
    events: {
      "click .save-button": 'saveSettings',
      "click .discard-button": 'discardChanges',
      "click .reset-default-button": 'resetSettingsToDefault',
      "change .app-settings input": 'enableSaveDiscardButton'
    },

    //make sure to call the parent method if you override this
    initialize: function () {
      this.displayed_settings = {}; //stores the currently modified settings
      this.original_settings = {};//reference to the original imported setting files
    },

    //you should override this and call your specific settings
    onRender: function () {

    },

    //displays the setting file on screens and adds an entry to it in the this.displayed_settings object
    addSettings: function (settings) {
      this.displayed_settings[settings.file_name] = {};
      this.original_settings[settings.file_name] = settings; //create a reference to the original settings
      for (var key in settings.default_settings) {
        if (settings.default_settings.hasOwnProperty(key)) {
          this.displayed_settings[settings.file_name][key] = null;  //the reference to the displayed input box
          var container = $('<div class="setting"><p>' + key + '</p></div>'); //create the input box and container for it

          var setting_type = typeof(settings.default_settings[key]) //check input type
          if( setting_type === "boolean"){
            var input = $('<input type="checkbox">');
          }else if(setting_type === "number"){
            var input = $('<input type="number">');
          }else{  
            var input = $('<input type="text">');
          }

          var setting_val = settings.get(key);
          if (_.isObject(setting_val)) {
            input.val(JSON.stringify(setting_val)); //stringify the value if its an object or array
          }
          else {
            input.val(setting_val); //otherwise if its a string or number just store it
          }
          container.append(input);
          this.ui.app_settings.append(container);
          this.displayed_settings[settings.file_name][key] = input;
        }
      }
    },

    //saves the displayed settings to local storage if they are valid (ie the type of the original setting is the type of the new setting)
    saveSettings: function () {
      var saving_error = false;
      for (var filename in this.displayed_settings) {
        if (this.displayed_settings.hasOwnProperty(filename)) { //go to the setting file
          for (var setting_key in this.displayed_settings[filename]) {
            if (this.displayed_settings[filename].hasOwnProperty(setting_key)) { //go to the setting
              var original_value = this.original_settings[filename].default_settings[setting_key];
              var new_value = this.displayed_settings[filename][setting_key].val();
              if (Validator.isObject(original_value)) { //if the original value is an object or array, try to do a json.parse and store it as an object
                var parsed_object = null;
                try {
                  parsed_object = JSON.parse(this.displayed_settings[filename][setting_key].val());
                } catch (e) {
                  this.showErrorMessage('The value for ' + setting_key + ' is not an object. Did not save the value');
                  saving_error = true;
                }
                if (parsed_object) {
                  this.original_settings[filename].set(setting_key, parsed_object);
                }
              }
              else if (_.isNumber(original_value)) { //if the original value is a number store the new value as a number
                if (Validator.isValidNumber(new_value)) {
                  var number = Number(new_value);
                  this.original_settings[filename].set(setting_key, number);
                } else {
                  this.showErrorMessage('The value for ' + setting_key + ' is not a number. Did not save the value');
                  saving_error = true;
                }
              }
              else { //otherwise just store it as a string
                this.original_settings[filename].set(setting_key, new_value);
              }
            }
          }
        }
      }
      if (!saving_error) {
        this.hideErrorMessage();
        this.disableSaveDiscardButton();
      }
    },

    //discards the current displayed setting changes on the window with the ones in local storage
    discardChanges: function () {
      for (var filename in this.displayed_settings) {
        if (this.displayed_settings.hasOwnProperty(filename)) { //go to the setting file
          for (var setting_key in this.displayed_settings[filename]) {
            if (this.displayed_settings[filename].hasOwnProperty(setting_key)) { //go to the setting
              var original_setting = this.original_settings[filename].get(setting_key);
              //reset the display of the input box to whatever the setting is currently stored as
              if (_.isObject(original_setting)) {
                this.displayed_settings[filename][setting_key].val(JSON.stringify(original_setting));
              }
              else {
                this.displayed_settings[filename][setting_key].val(original_setting);
              }
            }
          }
        }
      }
      this.disableSaveDiscardButton();
      this.hideErrorMessage();
    },

    //reset the local storage and the displayed setting to the one that is in the original config file
    resetSettingsToDefault: function () {
      for (var filename in this.displayed_settings) {
        if (this.displayed_settings.hasOwnProperty(filename)) { //go to the setting file
          for (var setting_key in this.displayed_settings[filename]) {
            if (this.displayed_settings[filename].hasOwnProperty(setting_key)) { //go to the setting
              var original_value = this.original_settings[filename].default_settings[setting_key];
              this.original_settings[filename].set(setting_key, original_value); //set the local storage value to the original

              //set the display to the original value
              if (_.isObject(original_value)) {
                this.displayed_settings[filename][setting_key].val(JSON.stringify(original_value));
              }
              else {
                this.displayed_settings[filename][setting_key].val(original_value);
              }
            }
          }
        }
      }
      this.disableSaveDiscardButton();
    },

    showErrorMessage: function (message) {
      if (message) {
        this.ui.error_message.text(message);
      }
      else {
        this.ui.error_message.text('An error occured.');
      }
      this.ui.error_message.show();
      $('body')[0].scrollTop = 0;
    },

    hideErrorMessage: function () {
      this.ui.error_message.hide();
    },
    enableSaveDiscardButton: function () {
      this.ui.save_button.prop('disabled', false);
      this.ui.discard_button.prop('disabled', false);
    },
    disableSaveDiscardButton: function () {
      this.ui.save_button.prop('disabled', true);
      this.ui.discard_button.prop('disabled', true);
    }
  });
};