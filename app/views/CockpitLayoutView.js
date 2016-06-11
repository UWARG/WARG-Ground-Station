/**
 * @author Serge Babayan
 * @module views/CockpitLayoutView
 * @requires util/Template
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description A layout view that includes the AttitudeView, AltitudeView, and ThrottleView
 */

var Template = require('../util/Template');

module.exports = function (Marionette) {
  var AttitudeView = require('./AttitudeView')(Marionette);
  var AltitudeView = require('./AltitudeView')(Marionette);
  var ThrottleView = require('./ThrottleView')(Marionette);

  return Marionette.LayoutView.extend({
    template: Template('CockpitLayoutView'),
    className: 'cockpitLayoutView',

    regions: {
      attitude_region: '.attitude-region',
      altitude_region: '.altitude-region',
      throttle_region: '.throttle-region'
    },

    initialize: function () {

    },
    onRender: function () {
      this.getRegion('attitude_region').show(new AttitudeView());
      this.getRegion('altitude_region').show(new AltitudeView());
      this.getRegion('throttle_region').show(new ThrottleView());
    },
    onBeforeDestroy: function () {
      //TODO: should call destroy on the item views here
    }
  });
};