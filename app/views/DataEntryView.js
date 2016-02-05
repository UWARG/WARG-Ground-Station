//This is an example Marionette view
//NOTE: you should not require jquery in your views, as you should only reference the elements inside the view which you can do with the ui property of the view
var Template = require('../util/Template');
var TelemetryData = require('../models/TelemetryData')
var fs = require('fs');
var Logger = require('../util/Logger');
/*
 call your other dependencies here (for example if you need to listen to network events, call this)
 var Network=require('../Network'); 
 then use the Network object inside your view
 */

module.exports = function (Marionette) {

    return Marionette.ItemView.extend({
        template: Template('DataEntryView'), //name of the file in the views folder at the project root
        className: 'gainsAdjustView', //this is the class name the injected div will have (refer to this class in your style sheets)

        ui: {//any ui elements in the view that you would like to reference within your view logic
            name_field: "#fileName",
            comment_field: "#comment",
            save_button: "#saveComment"
            
            

        },
        //your custom jquery events
        //selector then the name of the callback function
        events: {
            "click #saveComment": "saveData",
            
        },
        initialize: function () {

        },
        onRender: function () {
            //Logger.debug("SOMETHING IS WORKING");
        },
        onBeforeDestroy: function () {
            //called just before destroy is called on the view
        },
        onDestroy: function () {
            //called right after a destroy is called on the view
        },
        saveData: function (event) { //will be fired when a user clicks on #an-example-element

            var loc = "./logs/data_entries/" + this.ui.name_field.val()+".txt";
            var content="Comment: " +this.ui.comment_field.val() + "\r\nData Stream: " +JSON.stringify(TelemetryData.current_state);
            console.log(TelemetryData.current_state);
             fs.writeFile(loc, content, 'utf8', function(err){
             //Logger.debug("NOT RECIEVING DATA!");    
             });





        },
  
  


  
  
  
  
  
  
    }
);
};