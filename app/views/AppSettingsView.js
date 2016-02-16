var Template=require('../util/Template');
var ParentSettingsView=require('./ParentSettingsView');//the parent item view from which this one extends from

//the setting files from which to display
var advanced_config=require('../../config/advanced-config');
var app_config=require('../../config/application-config');
var map_config=require('../../config/map-config');
var picpilot_config=require('../../config/picpilot-config');

module.exports=function(Marionette,$){
  return ParentSettingsView(Marionette,$).extend({
    template:Template('AppSettingsView'),

    onRender:function(){
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