var Template=require('../util/Template');
var remote = require('electron').remote;
var TelemetryData=remote.require('./app/models/TelemetryData');

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('DataView'), //name of the file in the views folder at the project root
    className:'exampleView', //this is the class name the injected div will have (refer to this class in your style sheets)

    ui: {
    	data:'#data',
      current_date:'#current-date'
    },

    initialize: function(){
      this.telemetryCallback=null;
    },
    onRender:function(){
      this.telemetryCallback=this.dataCallback.bind(this);
      TelemetryData.on('data_received', this.telemetryCallback);
    },

    dataCallback: function(data){
      this.ui.data.text(JSON.stringify(data, null ,2));
      this.ui.current_date.text(new Date());
    },
    onBeforeDestroy:function(){
      //called just before destroy is called on the view
    }
  });
};