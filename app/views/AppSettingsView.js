var Template=require('../util/Template');
var advanced_config=require('../../config/advanced-config');
var app_config=require('../../config/application-config');
var map_config=require('../../config/map-config');
var picpilot_config=require('../../config/picpilot-config');

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('AppSettingsView'), //name of the file in the views folder at the project root
    className:'appSettingsView', //this is the class name the injected div will have (refer to this class in your style sheets)

    ui:{ //any ui elements in the view that you would like to reference within your view logic
      app_settings:'.app-settings'
    },

    //your custom jquery events
    //selector then the name of the callback function
    events:{
      "click #an-example-element": "clickCallback"
    },

    addSettings: function(settings){
      this.settings[settings.file_name]={};
      for(var key in settings.default_settings){
        if(settings.default_settings.hasOwnProperty(key)){
          this.settings[settings.file_name][key]={
            element: null,
            val: settings.get(key)
          };
          this.settings[settings.file_name][key].element=this.ui.app_settings.append('<div>'+key+'<input type="text"></div>');
          console.log(this.settings[settings.file_name][key].element);
        }
      }
    },

    initialize: function(){
      //called when the view is first initialized (ie new ExampleView())
      this.settings={}; //stores all the settings files so that we can dynamically display and modify them for the user
      
    },
    onRender:function(){
      //called right after a render is called on the view (view.render())
      this.addSettings(advanced_config);
      this.addSettings(app_config);
      this.addSettings(map_config);
      this.addSettings(picpilot_config);
    },
    onBeforeDestroy:function(){
      //called just before destroy is called on the view
    },
    onDestroy:function(){
      //called right after a destroy is called on the view
    },

    clickCallback:function(event){ //will be fired when a user clicks on #an-example-element

    }
  });
};