var Template=require('../util/Template');
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
      discard_button:'discard_button'
    },

    events:{
      "click .save-button": 'saveSettings',
      "click .discard-button":'discardChanges',
      "click .reset-default-button":'resetSettingsToDefault'
    },

    //adds the current settings to the settings object and adds an input for the setting to the screen
    addSettings: function(settings){
      this.settings[settings.file_name]={};
      for(var key in settings.default_settings){
        if(settings.default_settings.hasOwnProperty(key)){
          this.settings[settings.file_name][key]={
            element: null,
            val: settings.get(key)
          };
          var container=$('<div>'+key+'</div>');
          var input=$('<input type="text">');
          input.val(this.settings[settings.file_name][key].val);
          container.append(input);
          this.ui.app_settings.append(container);
          this.settings[settings.file_name][key].element=input;
        }
      }
    },

    initialize: function(){
      this.settings={}; //where all of the settings and newly modified settings will be stored
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
    saveSettings: function(){

    },
    discardChanges:function(){

    },
    resetSettingsToDefault: function(){

    }
  });
};