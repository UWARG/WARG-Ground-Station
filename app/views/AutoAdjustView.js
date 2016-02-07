var Template = require('../util/Template');
var Logger = require('../util/Logger');
var Commands = require('../models/Commands');

module.exports = function (Marionette) {

    return Marionette.ItemView.extend({
        template: Template('AutoAdjustView'),
        className: 'gainsAdjustView', 

        ui: { 

            all_button: "#sendall",
            rc_button: "#fullRC",
            auto_button: "fullAuto",
            ground_button: "fullGround",
            pitch_select: "#pitchsource",
            roll_select: "#rollsource",
            head_select: "#headsource",
            alt_select: "#altsource",
            throttle_select: "#throttlesource",
            flap_select: "#flapssource",
            rolltype_select: "#rolltype",
            pitchtype_select: "#pitchtype"

        },
     
        events: {
            "click #sendall": "sendall",
            "click #fullRC": "fullRC",
            "click #fullAuto":"fullAuto",
            "click #fullGround":"fullGround"
        },
        
        sendall: function (event) { 
            var autolevel=0;
           
            if (this.ui.head_select.val()==="Off")
            {
                
            } else
            {
                autolevel = autolevel + Math.pow(2,9);
            }
            if (this.ui.head_select.val()==="Autopilot")
            {
                autolevel = autolevel + Math.pow(2,8);
            } 
            if (this.ui.alt_select.val()==="Off")
            {
                
            } else
            {
                autolevel = autolevel + Math.pow(2,7);
            }
            if (this.ui.alt_select.val()==="Autopilot")
            {
                autolevel = autolevel + Math.pow(2,6);
            } 
            
             if(this.ui.throttle_select.val()==="Ground Station")
            {
                autolevel=autolevel+ Math.pow(2,4);
            }
            else if(this.ui.throttle_select.val()==="Autopilot")
            {
                autolevel=autolevel+Math.pow(2,5);
            }
            if (this.ui.roll_select.val()==="Ground Station")
            {
                autolevel = autolevel + Math.pow(2,3);
            } 
            if (this.ui.rolltype_select.val()==="Angle")
            {
               autolevel = autolevel + Math.pow(2,2);
            } 
            if (this.ui.pitch_select.val()==="Ground Station")
            {
                autolevel = autolevel + Math.pow(2,1);
            } 
            if (this.ui.pitchtype_select.val()==="Angle")
            {
               autolevel = autolevel +1; 
            } 
           
            Commands.sendAutoLevel(autolevel);
        },
        fullRC: function (event) { 
            Commands.sendAutoLevel(0);
        },
        fullAuto: function (event) { //full autopilot and groundstation (defaults to angle)
            Commands.sendAutoLevel(1007);
        },
        fullGround: function (event) { //full groundstation (defaults to angle)
            Commands.sendAutoLevel(671);
        }
    });
};