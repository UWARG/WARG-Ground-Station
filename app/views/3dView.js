/**
 * @author Serge Babayan
 * @module views/3dView
 * @requires util/Template
 * @requires models/PlaneScene
 * @requires util/Validator
 * @requires models/TelemetryData
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Responsible for displaying a 3D view of the aircraft's orientation using the data from the TelemetryData
 * module
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var PlaneScene = require('../models/PlaneScene');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Validator = require('../util/Validator');

module.exports = function (Marionette, THREE, window) {

  return Marionette.ItemView.extend({
    template: Template('3dView'),
    className: 'threeDView',

    ui: {
      plane_scene: '#plane-scene'
    },

    initialize: function () {
      this.planeScene = new PlaneScene(THREE, window);
    },
    onRender: function () {
      this.ui.plane_scene.append(this.planeScene.renderer.domElement);
      this.data_callback = this.dataCallback.bind(this);

      this.ui.plane_scene.resize(function () {
        this.planeScene.resize(this.ui.plane_scene.width(), this.ui.plane_scene.height());
      }.bind(this));

      TelemetryData.addListener('aircraft_orientation', this.data_callback);
    },

    dataCallback: function (data) {
      var set_pitch = 0, set_roll = 0, set_yaw = 0;

      if (data.heading !== null) {
        set_yaw = data.heading;
      }
      if (data.pitch !== null) {
        set_pitch = data.pitch;
      }
      if (data.roll !== null) {
        set_roll = data.roll;
      }
      this.planeScene.rotateAircraft(set_pitch, set_yaw, set_roll);
    },

    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_orientation', this.data_callback);
    }
  });
};