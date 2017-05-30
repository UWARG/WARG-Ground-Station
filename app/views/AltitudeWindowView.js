/**
 * @author Serge Babayan
 * @module views/AltitudeView
 * @requires models/Commands
 * @requires util/Validator
 * @requires util/Logger
 * @requires models/TelemetryData
 * @requires util/Template
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for displaying a the aircrafts altitude, air and ground speed via dials
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Logger = remote.require('./app/util/Logger');
var Validator = require('../util/Validator');
var Commands = remote.require('./app/models/Commands');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('AltitudeWindowView'),
    className: 'AltitudeWindowView',

    ui: {
        altitude_color: '.block2',
        altitude_height: '.block1',
        air_speed_current: '.current-value'
    },

    events: {


    },

    initialize: function () {
      //For drawing the dial correctly
      this.max_altitude = 100;

      this.telemetry_callback = null;
      this.first_resize = true;
    },
    onRender: function () {

      this.telemetry_callback = this.telemetryCallback.bind(this);
      TelemetryData.addListener('aircraft_position', this.telemetry_callback);
    },
    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_position', this.telemetry_callback);
    },
    telemetryCallback: function (data) {
      this.setAltitude(data.altitude);

    },

    setAltitude: function(altitude){
      if (altitude !== null){
        var int_alt = Number(altitude);
        var height = (int_alt / this.max_altitude) * 480;
        if (height <160){
          this.ui.altitude_color.css({'background-color': '#FF0000'});
        }

        else if (height >= 160 && height < 320){
          this.ui.altitude_color.css({'background-color': '#ffff00'});
        }

        else{
          this.ui.altitude_color.css({'background-color': '#008000'});
        }
        this.ui.altitude_height.css({'height': (480 - height).toString()});
        this.ui.air_speed_current.text(int_alt.toFixed(2));
      }

        /*if (height < 160){
          //ONE-THIRD OF THE BLOCK
          this.ui.altitude_height.css({'background-color': '#FF0000', 'height': height.tostring() + 'px'})  ;
        }

        else if (height >= 160 && height < 320){
          this.ui.altitude_height.css({'background-color': '#FFFF00','height': height.toString() + 'px'});
        }

        else {
          this.ui.altitude_height.css({'background-color': '#008000', 'height': height.toString() + 'px'});
        }
        this.ui.air_speed_current.text(int_alt.toFixed(2));
      }*/
    }
  });
};
