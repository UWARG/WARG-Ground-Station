/**
 * @author Serge Babayan
 * @module views/MainLayoutView
 * @requires util/Template
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description A layout view that includes the CockpitLayoutView, ConsoleView, StatusView, MapView and EmergencyButtonsView
 */

var Template = require('../util/Template');

module.exports = function (Marionette, $, L, window) {
  var StatusView = require('./StatusView')(Marionette, $);
  var CockpitLayoutView = require('./CockpitLayoutView')(Marionette);
  var MapView = require('./MapView')(Marionette, L, $);
  var EmergencyButtonsView = require('./EmergencyButtonsView')(Marionette, window);

  return Marionette.LayoutView.extend({
    template: Template('MainLayoutView'),
    className: 'mainLayoutView',

    regions: {
      status: "#status-region",
      map: "#right-region",
      telemetry: "#top-left-region",
      buttons: "#emergency-button-region"
    },

    onRender: function () {
      this.getRegion('status').show(new StatusView());
      this.getRegion('telemetry').show(new CockpitLayoutView());
      this.getRegion('map').show(new MapView());
      this.getRegion('buttons').show(new EmergencyButtonsView());
    },

    onDestroy: function () {
      //TODO: need to call the destroy events of the item views
    }
  });
};
