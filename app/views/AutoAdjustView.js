//This is an example Marionette view
//NOTE: you should not require jquery in your views, as you should only reference the elements inside the view which you can do with the ui property of the view
var Template=require('../util/Template');
var Logger = require('../util/Logger');
/*
call your other dependencies here (for example if you need to listen to network events, call this)
var Network=require('../Network'); 
then use the Network object inside your view
*/

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('AutoAdjustView'), //name of the file in the views folder at the project root
    className:'gainsAdjustView', //this is the class name the injected div will have (refer to this class in your style sheets)

    ui:{ //any ui elements in the view that you would like to reference within your view logic
      pitch_button:"#pitchsend", 
      roll_button:"#rollsend",
      head_button:"#headsend",
      alt_button:"#altsend",
      throttle_butotn:"#throttlesend",
      flap_button:"#flapsend",
      all_button:"#sendall",
      rc_button:"#fullRC",
     pitch_select:"#pitchsource",
     roll_select:"#rollsource",
     head_select:"#headsource",
     alt_select:"#altsource",
     throttle_select:"#throttlesource",
     flap_select:"#flapssource"
      
    },

    //your custom jquery events
    //selector then the name of the callback function
    events:{
      "click #pitchsend": "sendpitch",
      "click #rollsend": "sendroll",
      "click #headsend": "sendhead",
      "click #altsend": "sendalt",
      "click #throttlesend": "sendthrottle",
      "click #flapsend": "sendflap",
      "click #sendall": "sendall",
      "click #fullRC": "fullRC"
    },

    initialize: function(){
      //called when the view is first initialized (ie new ExampleView())
    },
    onRender:function(){
      //called right after a render is called on the view (view.render())
    },
    onBeforeDestroy:function(){
      //called just before destroy is called on the view
    },
    onDestroy:function(){
      //called right after a destroy is called on the view
    },

    clickCallback:function(event){ //will be fired when a user clicks on #an-example-element

    },
    sendpitch:function(event){ //will be fired when a user clicks on #an-example-element
    
    
    },
    sendroll:function(event){ //will be fired when a user clicks on #an-example-element
    
    },
    sendalt:function(event){ //will be fired when a user clicks on #an-example-element
    
    },
    sendthrottle:function(event){ //will be fired when a user clicks on #an-example-element
    
    },
    sendflap:function(event){ //will be fired when a user clicks on #an-example-element
    
    },
    sendall:function(event){ //will be fired when a user clicks on #an-example-element
    
    },
    fullRC:function(event){ //will be fired when a user clicks on #an-example-element
    
    }
  });
};