/**
 * @author Serge Babayan
 * @module views/GainsAdjustView
 * @requires util/Logger
 * @requires models/TelemetryData
 * @requires models/Commands
 * @requires util/Template
 * @requires util/Validator
 * @requires config/gains-config
 * @requires electron
 * @listens models/TelemetryData~TelemetryData:data_received
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description View for adjusting the aircraft's gain values
 */

var remote = require('electron').remote;
var Template = require('../util/Template');
var TelemetryData = remote.require('./app/models/TelemetryData');
var Commands = remote.require('./app/models/Commands');
var Validator = require('../util/Validator');
var Logger = remote.require('./app/util/Logger');
var gains_config = remote.require('./config/gains-config');

module.exports = function (Marionette) {

  return Marionette.ItemView.extend({
    template: Template('GainsAdjustView'),
    className: 'gainsAdjustView',

    ui: {
      
      roll_rate_kp: '#yaw-rate-kp',
      pitch_rate_kp: '#yaw-rate-kp',
      yaw_rate_kp: '#yaw-rate-kp',
      roll_angle_kp: '#roll-angle-kp',
      pitch_angle_kp: '#pitch-angle-kp',
      heading_kp: '#heading-kp',
      altitude_kp: '#altitude-kp',
      ground_speed_kp: '#ground-speed-kp',

      roll_rate_kd: '#yaw-rate-kd',
      pitch_rate_kd: '#yaw-rate-kd',
      yaw_rate_kd: '#yaw-rate-kd',
      roll_angle_kd: '#roll-angle-kd',
      pitch_angle_kd: '#pitch-angle-kd',
      heading_kd: '#heading-kd',
      altitude_kd: '#altitude-kd',
      ground_speed_kd: '#ground-speed-kd',

      roll_rate_ki: '#yaw-rate-ki',
      pitch_rate_ki: '#yaw-rate-ki',
      yaw_rate_ki: '#yaw-rate-ki',
      roll_angle_ki: '#roll-angle-ki',
      pitch_angle_ki: '#pitch-angle-ki',
      heading_ki: '#heading-ki',
      altitude_ki: '#altitude-ki',
      ground_speed_ki: '#ground-speed-ki',

      orbit_kp: '#orbit-kp',
      path_kp: '#path-kp',

      send_all: '#send-all-gains-button',
      reset_all: '#reset-default-gains-button',

      roll_rate_send_button: '#send-roll-rate-gains-button',
      pitch_rate_send_button: '#send-pitch-rate-gains-button',
      yaw_rate_send_button: '#send-yaw-rate-gains-button',
      roll_angle_send_button: '#send-roll-angle-gains-button',
      pitch_angle_send_button: '#send-pitch-angle-gains-button',
      heading_send_button: '#send-heading-gains-button',
      altitude_send_button: '#send-altitude-gains-button',
      ground_speed_send_button: '#send-ground-speed-gains-button',
      
      path_send_button: '#send-path-gain-button',
      orbit_send_button: '#send-orbit-gain-button'
    },

    events: {
      'click #send-all-gains-button': 'sendAllGains',
      'click #save-all-gains-button': 'saveChanges',
      'click #discard-all-gains-button': 'discardChanges',
      'click #reset-default-gains-button': 'resetToDefault',
      
      'click #send-roll-rate-button': 'sendRollRateGains',
      'click #send-pitch-rate-button': 'sendPitchRateGains',
      'click #send-yaw-rate-button': 'sendYawRateGains',
      'click #send-roll-angle-button': 'sendRollAngleGains',
      'click #send-pitch-angle-button': 'sendPitchAngleGains',
      'click #send-heading-button': 'sendHeadingGains',
      'click #send-altitude-button': 'sendAltitudeGains',
      'click #send-ground-speed-button': 'sendGroundSpeedGains',
      'click #send-orbit-gain-button': 'sendOrbitalGains',
      'click #send-path-gain-button': 'sendPathGains',

      'submit .roll-rate-form': 'sendRollRateGains',
      'submit .pitch-rate-form': 'sendPitchRateGains',
      'submit .yaw-rate-form': 'sendYawRateGains',
      'submit .roll-angle-form': 'sendRollAngleGains',
      'submit .pitch-angle-form': 'sendPitchAngleGains',
      'submit .heading-form': 'sendHeadingGains',
      'submit .altitude-form': 'sendAltitudeGains',
      'submit .ground-speed-form': 'sendGroundSpeedGains',
      'submit .orbit-form': 'sendOrbitalGains',
      'submit .path-form': 'sendPathGains'
    },

    initialize: function () {
      this.needs_verifying = {
        yaw: {
          status: false,
          ki: 0,
          kp: 0,
          kd: 0
        },
        pitch: {
          status: false,
          ki: 0,
          kp: 0,
          kd: 0
        },
        roll: {
          status: false,
          ki: 0,
          kp: 0,
          kd: 0
        },
        heading: {
          status: false,
          ki: 0,
          kp: 0,
          kd: 0
        },
        flap: {
          status: false,
          ki: 0,
          kp: 0,
          kd: 0
        },
        orbit: {
          status: false,
          ki: 0,
          kp: 0,
          kd: 0
        },
        path: {
          status: false,
          ki: 0,
          kp: 0,
          kd: 0
        },
        throttle: {
          status: false,
          ki: 0,
          kp: 0,
          kd: 0
        },
        altitude: {
          status: false,
          ki: 0,
          kp: 0,
          kd: 0
        }
      };
      this.data_callback = null;
    },

    onRender: function () {
      this.data_callback = this.dataCallback.bind(this);
      TelemetryData.addListener('aircraft_gains', this.data_callback);
      this.discardChanges(); //fills in the values from the settings
    },

    onBeforeDestroy: function () {
      TelemetryData.removeListener('aircraft_gains', this.data_callback);
    },

    //compares two values of gains with up to 3 decimal places of percision
    compareGains: function (gain1, gain2) {
      return gain1.toFixed(3) === gain2.toFixed(3);
    },

    dataCallback: function (data) {
      if (this.needs_verifying.yaw.status) {
        if (this.compareGains(data.yaw_kp, this.needs_verifying.yaw.kp) && this.compareGains(data.yaw_ki, this.needs_verifying.yaw.ki) && this.compareGains(data.yaw_kd, this.needs_verifying.yaw.kd)) {
          this.needs_verifying.yaw.status = false;
          Logger.info('[Gains Adjust] Yaw gain successfully verified!');
          this.ui.yaw_send_button.text('Send');
        }
      }
      if (this.needs_verifying.pitch.status) {
        if (this.compareGains(data.pitch_kp, this.needs_verifying.pitch.kp) && this.compareGains(data.pitch_ki, this.needs_verifying.pitch.ki) && this.compareGains(data.pitch_kd, this.needs_verifying.pitch.kd)) {
          this.needs_verifying.pitch.status = false;
          Logger.info('[Gains Adjust] Pitch gain successfully verified!');
          this.ui.pitch_send_button.text('Send');
        }
      }
      if (this.needs_verifying.roll.status) {
        if (this.compareGains(data.roll_kp, this.needs_verifying.roll.kp) && this.compareGains(data.roll_ki, this.needs_verifying.roll.ki) && this.compareGains(data.roll_kd, this.needs_verifying.roll.kd)) {
          this.needs_verifying.roll.status = false;
          Logger.info('[Gains Adjust] Roll gain successfully verified!');
          this.ui.roll_send_button.text('Send');
        }
      }
      if (this.needs_verifying.heading.status) {
        if (this.compareGains(data.heading_kp, this.needs_verifying.heading.kp) && this.compareGains(data.heading_ki, this.needs_verifying.heading.ki) && this.compareGains(data.heading_kd, this.needs_verifying.heading.kd)) {
          this.needs_verifying.heading.status = false;
          Logger.info('[Gains Adjust] Heading gain successfully verified!');
          this.ui.heading_send_button.text('Send');
        }
      }
      if (this.needs_verifying.flap.status) {
        if (this.compareGains(data.flap_kp, this.needs_verifying.flap.kp) && this.compareGains(data.flap_ki, this.needs_verifying.flap.ki) && this.compareGains(data.flap_kd, this.needs_verifying.flap.kd)) {
          this.needs_verifying.flap.status = false;
          Logger.info('[Gains Adjust] Flap gain successfully verified!');
          this.ui.flap_send_button.text('Send');
        }
      }
      if (this.needs_verifying.orbit.status) {
        if (this.compareGains(data.orbit_gain, this.needs_verifying.orbit.kp)) {
          this.needs_verifying.orbit.status = false;
          Logger.info('[Gains Adjust] Orbit gain successfully verified!');
          this.ui.orbit_send_button.text('Send');
        }
      }
      if (this.needs_verifying.throttle.status) {
        if (this.compareGains(data.throttle_kp, this.needs_verifying.throttle.kp) && this.compareGains(data.throttle_ki, this.needs_verifying.throttle.ki) && this.compareGains(data.throttle_kd, this.needs_verifying.throttle.kd)) {
          this.needs_verifying.throttle.status = false;
          Logger.info('[Gains Adjust] Throttle gain successfully verified!');
          this.ui.throttle_send_button.text('Send');
        }
      }
      if (this.needs_verifying.altitude.status) {
        if (this.compareGains(data.altitude_kp, this.needs_verifying.altitude.kp) && this.compareGains(data.altitude_ki, this.needs_verifying.altitude.ki) && this.compareGains(data.altitude_kd, this.needs_verifying.altitude.kd)) {
          this.needs_verifying.altitude.status = false;
          Logger.info('[Gains Adjust] Altitude gain successfully verified!');
          this.ui.altitude_send_button.text('Send');
        }
      }
      if (this.needs_verifying.path.status) {
        if (this.compareGains(data.path_gain, this.needs_verifying.path.kp)) {
          this.needs_verifying.path.status = false;
          Logger.info('[Gains Adjust] Path gain successfully verified!');
          this.ui.path_send_button.text('Send');
        }
      }
    },

    sendYawRateGains: function (e) {
      if (e) {
        e.preventDefault();
      }
      var ki = Number(this.ui.yaw_rate_ki.val());
      var kd = Number(this.ui.yaw_rate_kd.val());
      var kp = Number(this.ui.yaw_rate_kp.val());
      Commands.sendYawRateGains(kp, kd, ki);
      // this.needs_verifying.yaw = {
      //   status: true,
      //   ki: ki,
      //   kd: kd,
      //   kp: kp
      // };
      // this.ui.yaw_send_button.text('Verifying...');
    },
    sendPitchRateGains: function (e) {
      if (e) {
        e.preventDefault();
      }
      var ki = Number(this.ui.pitch_rate_ki.val());
      var kd = Number(this.ui.pitch_rate_kd.val());
      var kp = Number(this.ui.pitch_rate_kp.val());
      Commands.sendPitchRateGains(kp, kd, ki);
      // this.needs_verifying.pitch = {
      //   status: true,
      //   ki: ki,
      //   kd: kd,
      //   kp: kp
      // };
      // this.ui.pitch_send_button.text('Verifying...');
    },
    sendRollRateGains: function (e) {
      if (e) {
        e.preventDefault();
      }
      var ki = Number(this.ui.roll_rate_ki.val());
      var kd = Number(this.ui.roll_rate_kd.val());
      var kp = Number(this.ui.roll_rate_kp.val());
      Commands.sendRollRateGains(kp, kd, ki);
      // this.needs_verifying.roll = {
      //   status: true,
      //   ki: ki,
      //   kd: kd,
      //   kp: kp
      // };
      // console.log(this.needs_verifying);
      // this.ui.roll_send_button.text('Verifying...');
    },

    sendRollAngleGains: function (e) {
      if (e) {
        e.preventDefault();
      }
      var ki = Number(this.ui.roll_angle_ki.val());
      var kd = Number(this.ui.roll_angle_kd.val());
      var kp = Number(this.ui.roll_angle_kp.val());
      Commands.sendRollAngleGains(kp, kd, ki);
    },

    sendPitchAngleGains: function (e) {
      if (e) {
        e.preventDefault();
      }
      var ki = Number(this.ui.pitch_angle_ki.val());
      var kd = Number(this.ui.pitch_angle_kd.val());
      var kp = Number(this.ui.pitch_angle_kp.val());
      Commands.sendPitchAngleGains(kp, kd, ki);
    },
    sendHeadingGains: function (e) {
      if (e) {
        e.preventDefault();
      }
      var ki = Number(this.ui.heading_ki.val());
      var kd = Number(this.ui.heading_kd.val());
      var kp = Number(this.ui.heading_kp.val());
      Commands.sendHeadingGains(kp, kd, ki);
      // this.needs_verifying.heading = {
      //   status: true,
      //   ki: ki,
      //   kd: kd,
      //   kp: kp
      // };
      // this.ui.heading_send_button.text('Verifying...');
    },
    sendAltitudeGains: function (e) {
      if (e) {
        e.preventDefault();
      }
      var ki = Number(this.ui.altitude_ki.val());
      var kd = Number(this.ui.altitude_kd.val());
      var kp = Number(this.ui.altitude_kp.val());
      Commands.sendAltitudeGains(kp, kd, ki);
      // this.needs_verifying.altitude = {
      //   status: true,
      //   ki: ki,
      //   kd: kd,
      //   kp: kp
      // };
      // this.ui.altitude_send_button.text('Verifying...');
    },

    sendGroundSpeedGains: function (e) {
      if (e) {
        e.preventDefault();
      }
      var ki = Number(this.ui.altitude_ki.val());
      var kd = Number(this.ui.altitude_kd.val());
      var kp = Number(this.ui.altitude_kp.val());
      Commands.sendGroundSpeedGains(kp, kd, ki);
    },

    sendOrbitalGains: function (e) {
      if (e) {
        e.preventDefault();
      }
      var kp = Number(this.ui.orbit_kp.val());
      Commands.sendOrbitGain(kp);
      this.needs_verifying.orbit = {
        status: true,
        kp: kp
      };
      this.ui.orbit_send_button.text('Verifying...');
    },
    sendPathGains: function (e) {
      if (e) {
        e.preventDefault();
      }
      var kp = Number(this.ui.path_kp.val());
      Commands.sendPathGain(kp);
      this.needs_verifying.path = {
        status: true,
        kp: kp
      };
      this.ui.path_send_button.text('Verifying...');
    },
    sendAllGains: function () {
      this.sendYawRateGains();
      this.sendPitchRateGains();
      this.sendRollRateGains();
      this.sendRollAngleGains();
      this.sendPitchAngleGains();
      this.sendHeadingGains();
      this.sendAltitudeGains();
      this.sendGroundSpeedGains();
      this.sendOrbitalGains();
      this.sendPathGains();
    },
    //saves the gain if its a valid number
    checkAndSaveGain: function (id, value) {
      if (Validator.isValidNumber(value)) {
        gains_config.set(id, Number(value));
      }
      else {
        Logger.error('Did not save ' + id + ' gain as its not a valid number');
      }
    },

    saveChanges: function () {
      // this.checkAndSaveGain('yaw_kd', this.ui.yaw_kd.val());
      // this.checkAndSaveGain('yaw_ki', this.ui.yaw_ki.val());
      // this.checkAndSaveGain('yaw_kp', this.ui.yaw_kp.val());
      // this.checkAndSaveGain('pitch_kd', this.ui.pitch_kd.val());
      // this.checkAndSaveGain('pitch_ki', this.ui.pitch_ki.val());
      // this.checkAndSaveGain('pitch_kp', this.ui.pitch_kp.val());
      // this.checkAndSaveGain('roll_kd', this.ui.roll_kd.val());
      // this.checkAndSaveGain('roll_ki', this.ui.roll_ki.val());
      // this.checkAndSaveGain('roll_kp', this.ui.roll_kp.val());
      // this.checkAndSaveGain('heading_kd', this.ui.heading_kd.val());
      // this.checkAndSaveGain('heading_ki', this.ui.heading_ki.val());
      // this.checkAndSaveGain('heading_kp', this.ui.heading_kp.val());
      // this.checkAndSaveGain('altitude_kd', this.ui.altitude_kd.val());
      // this.checkAndSaveGain('altitude_ki', this.ui.altitude_ki.val());
      // this.checkAndSaveGain('altitude_kp', this.ui.altitude_kp.val());
      // this.checkAndSaveGain('throttle_kd', this.ui.throttle_kd.val());
      // this.checkAndSaveGain('throttle_ki', this.ui.throttle_ki.val());
      // this.checkAndSaveGain('throttle_kp', this.ui.throttle_kp.val());
      // this.checkAndSaveGain('flap_kd', this.ui.flap_kd.val());
      // this.checkAndSaveGain('flap_ki', this.ui.flap_ki.val());
      // this.checkAndSaveGain('flap_kp', this.ui.flap_kp.val());
      // this.checkAndSaveGain('orbit_kp', this.ui.orbit_kp.val());
      // this.checkAndSaveGain('path_kp', this.ui.path_kp.val());
    },
    discardChanges: function () {
      // this.ui.yaw_kd.val(gains_config.get('yaw_kd'));
      // this.ui.yaw_ki.val(gains_config.get('yaw_ki'));
      // this.ui.yaw_kp.val(gains_config.get('yaw_kp'));
      // this.ui.pitch_kd.val(gains_config.get('pitch_kd'));
      // this.ui.pitch_ki.val(gains_config.get('pitch_ki'));
      // this.ui.pitch_kp.val(gains_config.get('pitch_kp'));
      // this.ui.roll_kd.val(gains_config.get('roll_kd'));
      // this.ui.roll_ki.val(gains_config.get('roll_ki'));
      // this.ui.roll_kp.val(gains_config.get('roll_kp'));
      // this.ui.heading_kd.val(gains_config.get('heading_kd'));
      // this.ui.heading_ki.val(gains_config.get('heading_ki'));
      // this.ui.heading_kp.val(gains_config.get('heading_kp'));
      // this.ui.altitude_kd.val(gains_config.get('altitude_kd'));
      // this.ui.altitude_ki.val(gains_config.get('altitude_ki'));
      // this.ui.altitude_kp.val(gains_config.get('altitude_kp'));
      // this.ui.throttle_kd.val(gains_config.get('throttle_kd'));
      // this.ui.throttle_ki.val(gains_config.get('throttle_ki'));
      // this.ui.throttle_kp.val(gains_config.get('throttle_kp'));
      // this.ui.flap_kd.val(gains_config.get('flap_kd'));
      // this.ui.flap_ki.val(gains_config.get('flap_ki'));
      // this.ui.flap_kp.val(gains_config.get('flap_kp'));
      // this.ui.orbit_kp.val(gains_config.get('orbit_kp'));
      // this.ui.path_kp.val(gains_config.get('path_kp'));
    },
    resetToDefault: function () {
      // this.ui.yaw_kd.val(gains_config.default_settings['yaw_kd']);
      // this.ui.yaw_ki.val(gains_config.default_settings['yaw_ki']);
      // this.ui.yaw_kp.val(gains_config.default_settings['yaw_kp']);
      // this.ui.pitch_kd.val(gains_config.default_settings['pitch_kd']);
      // this.ui.pitch_ki.val(gains_config.default_settings['pitch_ki']);
      // this.ui.pitch_kp.val(gains_config.default_settings['pitch_kp']);
      // this.ui.roll_kd.val(gains_config.default_settings['roll_kd']);
      // this.ui.roll_ki.val(gains_config.default_settings['roll_ki']);
      // this.ui.roll_kp.val(gains_config.default_settings['roll_kp']);
      // this.ui.heading_kd.val(gains_config.default_settings['heading_kd']);
      // this.ui.heading_ki.val(gains_config.default_settings['heading_ki']);
      // this.ui.heading_kp.val(gains_config.default_settings['heading_kp']);
      // this.ui.altitude_kd.val(gains_config.default_settings['altitude_kd']);
      // this.ui.altitude_ki.val(gains_config.default_settings['altitude_ki']);
      // this.ui.altitude_kp.val(gains_config.default_settings['altitude_kp']);
      // this.ui.throttle_kd.val(gains_config.default_settings['throttle_kd']);
      // this.ui.throttle_ki.val(gains_config.default_settings['throttle_ki']);
      // this.ui.throttle_kp.val(gains_config.default_settings['throttle_kp']);
      // this.ui.flap_kd.val(gains_config.default_settings['flap_kd']);
      // this.ui.flap_ki.val(gains_config.default_settings['flap_ki']);
      // this.ui.flap_kp.val(gains_config.default_settings['flap_kp']);
      // this.ui.orbit_kp.val(gains_config.default_settings['orbit_kp']);
      // this.ui.path_kp.val(gains_config.default_settings['path_kp']);

      // this.saveChanges();
    }
  });
};