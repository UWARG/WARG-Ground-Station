/**
 * @author Serge Babayan
 * @module views/EmergencyButtonsView
 * @requires models/Commands
 * @requires util/Template
 * @requires electron
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Emergency button view for triggering commands to kill the plane, etc..
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var Commands = remote.require('./app/models/Commands');

//Note this view requires the global window object for the alert boxes (at least for now)
module.exports = function (Marionette, window) {

  return Marionette.ItemView.extend({
    template: Template('EmergencyButtonsView'),
    className: 'emergencyButtonsView',

    events: {
      'click #arm-plane-button': 'armPlane',
      'click #disarm-plane-button': 'disarmPlane',
      'click #kill-plane-button': 'killPlane',
      'click #unkill-plane-button': 'unkillPlane',
      'click #drop-probe-button': 'dropProbe',
      'click #go-home-button': 'returnHome',
      'click #ungo-home-button': 'cancelReturnHome'
    },

    writeMode: function () {
      if (window.confirm('This will convert the groundstation from READ ONLY mode to WRITE mode. Are you sure you want to do this?')) {
        Commands.activateWriteMode();
      }
    },

    armPlane: function () {
      if (window.confirm('This command arms the plane. Is everyone away from the propeller?')) {
        Commands.armPlane();
      }
    },

    disarmPlane: function () {
      Commands.disarmPlane();
    },

    killPlane: function () {
      if (window.confirm('Are you sure you want to kill the plane? This WILL crash the plane. (1/2)') && window.confirm('Are you ABSOLUTELY SURE you want to do this? (2/2)')) {
        Commands.killPlane();
      }
    },

    unkillPlane: function () {
      Commands.unkillPlane();
    },

    returnHome: function () {
      Commands.returnHome();
    },

    cancelReturnHome: function () {
      Commands.cancelReturnHome();
    }
  });
};