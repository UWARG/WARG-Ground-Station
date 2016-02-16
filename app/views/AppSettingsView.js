var _=require('underscore');
var Template=require('../util/Template');
var Validator=require('../util/Validator');
var advanced_config=require('../../config/advanced-config');
var app_config=require('../../config/application-config');
var map_config=require('../../config/map-config');
var picpilot_config=require('../../config/picpilot-config');

module.exports=function(Marionette,$){
  return Marionette.ItemView.extend({
    template:Template('AppSettingsView'), 
    className:'appSettingsView',

    ui:{
      app_settings:'.app-settings',
      save_button:'.save-button',
      discard_button:'.discard-button',
      error_message: '.error-message-box'
    },

    events:{
      "click .save-button": 'saveSettings',
      "click .discard-button":'discardChanges',
      "click .reset-default-button":'resetSettingsToDefault',
      "change .app-settings input":'enableSaveDiscardButton'
    },

    initialize: function(){
      this.settings={}; //where all of the settings and newly modified settings will be stored
      this.original_settings={};
    },

    onRender:function(){
      //called right after a render is called on the view (view.render())
      this.ui.app_settings.append('<h2>Advanced Settings</h2>');
      this.addSettings(advanced_config);
      this.ui.app_settings.append('<h2>Application Settings</h2>');
      this.addSettings(app_config);
      this.ui.app_settings.append('<h2>Map Settings</h2>');
      this.addSettings(map_config);
      this.ui.app_settings.append('<h2>Picpilot Settings</h2>');
      this.addSettings(picpilot_config);
    },

    //adds the current settings to the settings object and adds an input for the setting to the screen
    addSettings: function(settings){
      this.settings[settings.file_name]={};
      this.original_settings[settings.file_name]=settings;
      for(var key in settings.default_settings){
        if(settings.default_settings.hasOwnProperty(key)){
          this.settings[settings.file_name][key]={
            element: null,
            val: settings.get(key)
          };
          var container=$('<div class="setting"><p>'+key+'</p></div>');
          var input=$('<input type="text">');
          var setting_val=this.settings[settings.file_name][key].val;
          if(_.isObject(setting_val)){
            input.val(JSON.stringify(setting_val));
          }
          else{
            input.val(setting_val);
          }
          container.append(input);
          this.ui.app_settings.append(container);
          this.settings[settings.file_name][key].element=input;
        }
      }
    },
    saveSettings: function(){
      var saving_error=false;
      for(var filename in this.settings){
        if(this.settings.hasOwnProperty(filename)){ //go to the setting file
          for(var setting_key in this.settings[filename]){
            if(this.settings[filename].hasOwnProperty(setting_key)){ //go to the setting
              var original=this.original_settings[filename].default_settings[setting_key];
              var new_value=this.settings[filename][setting_key].element.val();
              if (Validator.isValidObject(original)){ //do a json.parse to store it back as an object
                var parsed_object=null;
                try{
                  parsed_object=JSON.parse(this.settings[filename][setting_key].element.val());
                }catch(e){
                  this.showErrorMessage('The value for '+setting_key+' is not an object. Did not save the value');
                  saving_error=true;
                }
                if(parsed_object){
                  this.original_settings[filename].set(setting_key,parsed_object);
                }
              }
              else if (_.isNumber(original)){ //if the original setting is a number store it as a number
                if(Validator.isValidNumber(new_value)){     
                  var number=Number(new_value);
                  this.original_settings[filename].set(setting_key,Number(this.settings[filename][setting_key].element.val()));
                }else{
                  this.showErrorMessage('The value for '+setting_key+' is not a number. Did not save the value');
                  saving_error=true;
                }
              }
              else { //otherwise just store it as a string
                this.original_settings[filename].set(setting_key,this.settings[filename][setting_key].element.val());
              }
            }
          }
        }
      }
      if(!saving_error){
        this.hideErrorMessage();
        this.disableSaveDiscardButton();
      }
    },

    discardChanges:function(){
      for(var filename in this.settings){
        if(this.settings.hasOwnProperty(filename)){ //go to the setting file
          for(var setting_key in this.settings[filename]){
            if(this.settings[filename].hasOwnProperty(setting_key)){ //go to the setting
              var original_setting=this.original_settings[filename].get(setting_key);
              //reset the display of the input box to whatever the setting is currently stored as
              if(_.isObject(original_setting)){
                this.settings[filename][setting_key].element.val(JSON.stringify(original_setting));
              }
              else{
                this.settings[filename][setting_key].element.val(original_setting);
              }
            }
          }
        }
      }
      this.disableSaveDiscardButton();
    },

    resetSettingsToDefault: function(){
      for(var filename in this.settings){
        if(this.settings.hasOwnProperty(filename)){ //go to the setting file
          for(var setting_key in this.settings[filename]){
            if(this.settings[filename].hasOwnProperty(setting_key)){ //go to the setting
              var original_value=this.original_settings[filename].default_settings[setting_key];
              var original_setting=this.original_settings[filename].set(setting_key,original_value);
              if(_.isObject(original_value)){
                this.settings[filename][setting_key].element.val(JSON.stringify(original_value));
              }
              else{
                this.settings[filename][setting_key].element.val(original_value);
              }
            }
          }
        }
      }
      this.disableSaveDiscardButton();
    },

    showErrorMessage: function(message){
      if(message){
        this.ui.error_message.text(message);
      }
      else{
        this.ui.error_message.text('An error occured.');
      }
      this.ui.error_message.show();
      $('body')[0].scrollTop=0;
    },

    hideErrorMessage: function(){
      this.ui.error_message.hide();
    },
    enableSaveDiscardButton: function(){
      this.ui.save_button.prop('disabled',false);
      this.ui.discard_button.prop('disabled',false);
    },
    disableSaveDiscardButton: function(){
      this.ui.save_button.prop('disabled',true);
      this.ui.discard_button.prop('disabled',true);
    }
  });
};