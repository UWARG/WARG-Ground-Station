var Template = require('../util/Template');
var Logger = require('../util/Logger');
var Commands = require('../models/Commands');

module.exports = function(Marionette) {

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
      pitchtype_select: "#pitchtype",
      alttype_select: '#altitudetype',
      headingtype_select: '#headingtype'
    },

    events: {
      "click #sendall": "sendAll",
      "click #fullRC": "fullRC",
      "click #fullAuto": "fullAuto",
      "click #fullGround": "fullGround"
    },

    sendAll: function(event) {
      var autolevel = 0;
      if (this.ui.flap_select.val() === "Autopilot") {
        autolevel = autolevel + Math.pow(2, 11);
      }
      else if (this.ui.flap_select.val() === "Ground Station") {
        autolevel = autolevel + Math.pow(2, 10);
      }
      if (this.ui.headingtype_select.val() === "On") {
        autolevel = autolevel + Math.pow(2, 9);
      }
      if (this.ui.head_select.val() === "Autopilot") {
        autolevel = autolevel + Math.pow(2, 8);
      }
      if (this.ui.alttype_select.val() === "On") {
        autolevel = autolevel + Math.pow(2, 7);
      }
      if (this.ui.alt_select.val() === "Autopilot") {
        autolevel = autolevel + Math.pow(2, 6);
      }
      if (this.ui.throttle_select.val() === "Autopilot") {
        autolevel = autolevel + Math.pow(2, 5);
      }
      else if (this.ui.throttle_select.val() === "Ground Station") { //we dont add anything if its a controller
        autolevel = autolevel + Math.pow(2, 4);
      }
      if (this.ui.roll_select.val() === "Ground Station") {
        autolevel = autolevel + Math.pow(2, 3);
      }
      if (this.ui.rolltype_select.val() === "Angle") {
        autolevel = autolevel + Math.pow(2, 2);
      }
      if (this.ui.pitch_select.val() === "Ground Station") {
        autolevel = autolevel + Math.pow(2, 1);
      }
      if (this.ui.pitchtype_select.val() === "Angle") {
        autolevel = autolevel + 1;
      }
      Commands.sendAutoLevel(autolevel);
    },

    fullRC: function(event) {
      this.ui.flap_select.val('Controller');
      this.ui.throttle_select.val('Controller');
      this.ui.alt_select.val('Ground Station');
      this.ui.head_select.val('Ground Station');
      this.ui.roll_select.val('Controller');
      this.ui.pitch_select.val('Controller');
      this.ui.pitchtype_select.val('Rate');
      this.ui.rolltype_select.val('Rate');
      this.ui.headingtype_select.val('Off');
      this.ui.alttype_select.val('Off');
      this.sendAll();
    },

    fullAuto: function(event) { //full autopilot and groundstation (defaults to angle)
      this.ui.flap_select.val('Autopilot');
      this.ui.throttle_select.val('Autopilot');
      this.ui.alt_select.val('Autopilot');
      this.ui.head_select.val('Autopilot');
      this.ui.roll_select.val('Ground Station');
      this.ui.pitch_select.val('Ground Station');
      this.ui.pitchtype_select.val('Angle');
      this.ui.rolltype_select.val('Angle');
      this.ui.headingtype_select.val('On');
      this.ui.alttype_select.val('On');
      this.sendAll();
    },

    fullGround: function(event) { //full groundstation (defaults to angle)
      this.ui.flap_select.val('Ground Station');
      this.ui.throttle_select.val('Ground Station');
      this.ui.alt_select.val('Ground Station');
      this.ui.head_select.val('Ground Station');
      this.ui.roll_select.val('Ground Station');
      this.ui.pitch_select.val('Ground Station');
      this.ui.pitchtype_select.val('Angle');
      this.ui.rolltype_select.val('Angle');
      this.ui.headingtype_select.val('On');
      this.ui.alttype_select.val('On');
      this.sendAll();
    }
  });
};
//this is copied from the data link documentation
/*
0b0000000000 = Full manual control (default)
0b0000000001 = Set Pitch Rate(0), Pitch Angle(1)
0b0000000010 = Pitch Control Source: Controller(0), Ground Station(1) 
0b0000000100 = Roll Control Type: Roll Rate(0), Roll Angle(1)
0b0000001000 = Roll Control Sources: Controller(0), Ground Station(1)
0b0000110000 = Throttle control source: Controller(0), Ground Station(1), Autopilot(2)
0b0001000000 = Altitude Source: Ground Station(0), Autopilot(1)
0b0010000000 = Altitude Control On(1) or Off(0)
0b0100000000 = Heading control source: Ground Station(0), Autopilot(1)
0b1000000000= To fly with Ground Station Control of the Pitch Rate and Roll Angle:
*/