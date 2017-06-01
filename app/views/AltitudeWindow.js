var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var PacketTypes = require('../models/PacketTypes');
var _ = require('underscore');

module.exports = function (Marionette, Backbone) {
  return Marionette.ItemView.extend({
    template: Template('AltitudeWindow'), //name of the file in the views folder at the project root
    className: 'altitudeWindow', //this is the class name the injected div will have (refer to this class in your style sheets)
    
    events:{
      'click .btn-max-height': 'setMaxHeight'
    },
    
    ui:{
      altitude: '.altitude-display',
      front: '.front',
      maxHeight: '.set-max-height.ipt-max-height',
      setBtn: '.set-max-height.btn-max-height',
      maxHdisplay: '.max-height',
    },
    
    /*
    events: {
      'click #current-altitude-string': 'toggleKeepLastPacket'
    },
    */
    
    initialize: function () {
      this.telemetry_callback = null;
      this.altitude = null;
      this.max = null;
    },
    
    onRender: function() {
      this.altitude_callback = this.altitude_callback.bind(this);
      TelemetryData.addListener('aircraft_position', this.altitude_callback);
    },

    altitude_callback: function (data) {
      var alt = data.altitude;
      if(alt!=null && this.max != null){
        var percent = (1-(alt/this.max));
        console.log("per:",percent);
        console.log("alt:",alt);
        console.log("max:",this.max);
        this.ui.altitude.text(alt.toFixed(1));
        var result = 400*percent;
        this.ui.front.css('height',result.toString()+'px');
      }
      //this.altitude = data.altitude;
    },
    
    setMaxHeight: function(e){
      e.preventDefault();
      this.max=this.ui.maxHeight.val();
      console.log(this.max);
      this.ui.maxHdisplay.html(this.max);
    },
    
    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_position',this.altitude_callback);
    },
  })
};
