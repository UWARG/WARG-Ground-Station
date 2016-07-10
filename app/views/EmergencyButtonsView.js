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
var WindowManager = remote.require('./app/core/WindowManager');
var dialog = remote.dialog;

//Note this view requires the global window object for the alert boxes (at least for now)
module.exports = function (Marionette, window) {

  return Marionette.ItemView.extend({
    template: Template('EmergencyButtonsView'),
    className: 'emergencyButtonsView',

    events: {
      'click #write-mode-button': 'writeMode',
      'click #arm-plane-button': 'armPlane',
      'click #disarm-plane-button': 'disarmPlane',
      'click #kill-plane-button': 'killPlane',
      'click #unkill-plane-button': 'unkillPlane',
      'click #drop-probe-button': 'dropProbe',
      'click #go-home-button': 'returnHome',
      'click #ungo-home-button': 'cancelReturnHome'
    },

    writeMode: function () {
      dialog.showMessageBox({
        type: 'warning',
        buttons: ['Cancel', 'Go Write Mode'],
        defaultId: 0,
        title: 'Confirm Write Mode',
        message: 'This will convert the ground station from READ ONLY mode to WRITE mode. Are you sure you want to do this?',
      }, function (response) {
        if (response === 1) {
          Commands.activateWriteMode();
        }
      });
    },

    armPlane: function () {
      dialog.showMessageBox({
        type: 'warning',
        buttons: ['Cancel', 'Arm Plane'],
        defaultId: 0,
        title: 'Confirm Arm Plane',
        message: 'This command arms the plane. Is everyone away from the propeller?',
      }, function (response) {
        if (response === 1) {
          Commands.armPlane();
        }
      });
    },

    disarmPlane: function () {
      Commands.disarmPlane();
    },

    killPlane: function () {
      dialog.showMessageBox({
        type: 'warning',
        buttons: ['Cancel', 'Kill Plane'],
        defaultId: 0,
        title: 'Confirm Kill Plane',
        message: 'Are you sure you want to kill the plane? This WILL crash the plane?',
      }, function (response) {
        if (response === 1) {
          Commands.killPlane();
        }
      });
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