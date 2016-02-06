//This is an example Marionette view
//NOTE: you should not require jquery in your views, as you should only reference the elements inside the view which you can do with the ui property of the view
var Template = require('../util/Template');
var Logger = require('../util/Logger');
var Commands = require('../models/Commands');
/*
 call your other dependencies here (for example if you need to listen to network events, call this)
 var Network=require('../Network'); 
 then use the Network object inside your view
 */

module.exports = function (Marionette) {

    return Marionette.ItemView.extend({
        template: Template('AutoAdjustView'), //name of the file in the views folder at the project root
        className: 'gainsAdjustView', //this is the class name the injected div will have (refer to this class in your style sheets)

        ui: { //any ui elements in the view that you would like to reference within your view logic

            all_button: "#sendall",
            rc_button: "#fullRC",
            pitch_select: "#pitchsource",
            roll_select: "#rollsource",
            head_select: "#headsource",
            alt_select: "#altsource",
            throttle_select: "#throttlesource",
            flap_select: "#flapssource",
            rolltype_select: "#rolltype",
            pitchtype_select: "#pitchtype"

        },
        //your custom jquery events
        //selector then the name of the callback function
        events: {
            "click #sendall": "sendall",
            "click #fullRC": "fullRC"
        },
        initialize: function () {
            //called when the view is first initialized (ie new ExampleView())
        },
        onRender: function () {
            //called right after a render is called on the view (view.render())
        },
        onBeforeDestroy: function () {
            //called just before destroy is called on the view
        },
        onDestroy: function () {
            //called right after a destroy is called on the view
        },
        clickCallback: function (event) { //will be fired when a user clicks on #an-example-element

        },
        sendall: function (event) { //will be fired when a user clicks on #an-example-element
            var autolevel = "0b";
           
            if (this.ui.head_select.val()==="Off")
            {
                autolevel = autolevel + "0";
            } else
            {
                autolevel = autolevel + "1";
            }
            if (this.ui.head_select.val()==="Autopilot")
            {
                autolevel = autolevel + "1";
            } else
            {
                autolevel = autolevel + "0";
            }
            if (this.ui.alt_select.val()==="Off")
            {
                autolevel = autolevel + "0";
            } else
            {
                autolevel = autolevel + "1";
            }
            if (this.ui.alt_select.val()==="Autopilot")
            {
                autolevel = autolevel + "1";
            } else
            {
                autolevel = autolevel + "0";
            }
            if (this.ui.throttle_select.val()==="Controller")
            {
                autolevel=autolevel+"00";
            }
            else if(this.ui.throttle_select.val()==="Ground Station")
            {
                autolevel=autolevel+"01";
            }
            else
            {
                autolevel=autolevel+"10";
            }
            if (this.ui.roll_select.val()==="Ground Station")
            {
                autolevel = autolevel + "1";
            } else
            {
                autolevel = autolevel + "0";
            }
            if (this.ui.rolltype_select.val()==="Rate")
            {
                autolevel = autolevel + "0";
            } else
            {
                autolevel = autolevel + "1";
            }
            if (this.ui.pitch_select.val()==="Ground Station")
            {
                autolevel = autolevel + "1";
            } else
            {
                autolevel = autolevel + "0";
            }
            if (this.ui.pitchtype_select.val()==="Rate")
            {
                autolevel = autolevel + "0";
            } else
            {
                autolevel = autolevel + "1";
            }
            //Logger.debug(autolevel);
            Commands.sendAutoLevel(autolevel);
        },
        fullRC: function (event) { //will be fired when a user clicks on #an-example-element
            Commands.sendAutoLevel(0);
        }
    });
};