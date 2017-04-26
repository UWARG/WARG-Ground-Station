/**
 * @author Serge Babayan
 * @module util/Validator
 * @requires underscore
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Useful and commonly used validation functions used throughout the app
 */

var _ = require('underscore');

var Validator = {
  /**
   * Checks if a value is numeric (Note: `'123.32'` and `123.32` are both numeric)
   * @function isValidNumber
   * @param number {string | Number} The value to check
   * @returns {boolean}
   */
  isValidNumber: function (number) {
    return !isNaN(parseFloat(number)) && isFinite(number);
  },

  /**
   * Checks if a value is a float only
   * @function isFloat
   * @param number {string | Number} The value to check
   * @returns {boolean}
   * @example
   * Validator.isFloat('23.23') //true
   * Validator.isFloat(34.44) //true
   * Validator.isFloat(4) //false
   * Validator.isFloat('4') //false
   */
  isFloat: function (number) {
    if (this.isValidNumber(number)) {
      var n = Number(number);
      return n === +n && n !== (n | 0);
    }
    else {
      return false;
    }
  },

  /**
   * Checks if a value is an integer only
   * @function isInteger
   * @param number {string | Number} The value to check
   * @returns {boolean}
   * @example
   * Validator.isInteger('23.23') //false
   * Validator.isInteger(34.44) //false
   * Validator.isInteger(4) //true
   * Validator.isInteger('4') //true
   */
  isInteger: function (number) {
    if (this.isValidNumber(number)) {
      var n = Number(number);
      return n === +n && n === (n | 0);
    }
    else {
      return false;
    }
  },

  /**
   * Checks if a value is a positive number
   * @function isPositiveNumber
   * @param number {string | Number} The value to check
   * @returns {boolean}
   */
  isPositiveNumber: function (number) {
    return this.isValidNumber(number) && Number(number) >= 0;
  },

  /**
   * Checks if a value is a bollean integer (1 or 0)
   * @function isBooleanInt
   * @param number {string | Number} The value to check
   * @returns {boolean}
   */
  isBooleanInt: function (number) {
    return this.isInteger(number) && (number == 1 || number == 0);
  },

  /**
   * Checks if a value is a string
   * @function isString
   * @param value {mixed} The value to check
   * @returns {boolean}
   */
  isString: function (value) {
    return typeof value === 'string' || value instanceof String;
  },

  /**
   * Checks if a value is a string
   * @function isNonEmptyString
   * @param value {string} The value to check
   * @returns {boolean}
   */
  isNonEmptyString: function (value) {
    return this.isString(value) && value.trim().length > 0;
  },

  /**
   * Checks if a value is an object
   * @function isObject
   * @param object {Object} The value to check
   * @returns {boolean}
   */
  isObject: function (object) {
    return _.isObject(object);
  },

  /**
   * Checks if a value is valid percentage between 0 and 100
   * @function isValidPercentage
   * @param percentage {string | Number} The value to check
   * @returns {boolean}
   */
  isValidPercentage: function (percentage) {
    if (this.isValidNumber(percentage)) {
      var num = Number(percentage);
      if (num >= 0 && num <= 100) {
        return true;
      }
    }
    return false;
  },

  /**
   * Checks if a value is valid pitch (number between -180 and 180)
   * @function isValidPitch
   * @param pitch {string | Number} The value to check
   * @returns {boolean}
   */
  isValidPitch: function (pitch) {
    if (this.isValidNumber(pitch)) {
      pitch = Number(pitch);
      return pitch >= -180 && pitch <= 180;
    }
    return false;
  },

  /**
   * Checks if a value is valid roll (number between -180 and 180)
   * @function isValidRoll
   * @param roll {string | Number} The value to check
   * @returns {boolean}
   */
  isValidRoll: function (roll) {
    if (this.isValidNumber(roll)) {
      roll = Number(roll);
      return roll >= -180 && roll <= 180;
    }
    return false;
  },

  /**
   * Checks if a value is valid roll
   * @function isValidYaw
   * @param yaw {string | Number} The value to check
   * @returns {boolean}
   */
  isValidYaw: function (yaw) {
    return this.isValidNumber(yaw);
  },

  /**
   * Checks if a value is valid roll (number between 0 and 360)
   * @function isValidHeading
   * @param heading {string | Number} The value to check
   * @returns {boolean}
   */
  isValidHeading: function (heading) {
    if (this.isValidNumber(heading)) {
      heading = Number(heading);
      return heading >= 0 && heading <= 360;
    }
    return false;
  },

  /**
   * Checks if a value is valid, positive speed
   * @function isValidSpeed
   * @param speed {string | Number} The value to check
   * @returns {boolean}
   */
  isValidSpeed: function (speed) {
    return this.isPositiveNumber(speed);
  },

  /**
   * Checks if a value is valid altitude (number above -5m)
   * @function isValidAltitude
   * @param altitude {string | Number} The value to check
   * @returns {boolean}
   */
  isValidAltitude: function (altitude) {
    return this.isValidNumber(altitude) && Number(altitude) > -5;
  },

  /**
   * Checks if a value is valid 10-bit pwm value (between -1024 and 1024)
   * @function isValidPWM
   * @param value {string | Number} The value to check
   * @returns {boolean}
   */
  isValidPWM: function (value) {
    if (this.isInteger(value)) {
      value = Number(value);
      return value >= -1024 && value <= 1024;
    }
    return false;
  },

  /**
   * Checks if a value is valid throttle (between -1024 and 1024)
   * @function isValidThrottle
   * @param throttle {string | Number} The value to check
   * @returns {boolean}
   */
  isValidThrottle: function (throttle) {
    return this.isValidPWM(throttle);
  },

  /**
   * Checks if a value is valid flap (between -1024 and 1024)
   * @function isValidFlap
   * @param flap {string | Number} The value to check
   * @returns {boolean}
   */
  isValidFlap: function (flap) {
    return this.isValidPWM(flap);
  },

  /**
   * Checks if a value is valid latitude
   * @function isValidLatitude
   * @param lat {string | Number} The value to check
   * @returns {boolean}
   */
  isValidLatitude: function (lat) {
    return this.isValidNumber(lat);
  },

  /**
   * Checks if a value is valid longitude
   * @function isValidLongitude
   * @param lon {string | Number} The value to check
   * @returns {boolean}
   */
  isValidLongitude: function (lon) {
    return this.isValidNumber(lon);
  },

  /**
   * Checks if a value is valid UTC time
   * @function isValidTime
   * @param timestring {string | Number} The value to check
   * @returns {boolean}
   */
  isValidTime: function (timestring) {
    return this.isPositiveNumber(timestring);
  },

  /**
   * Checks if a value is valid battery level
   * @function isValidBattery
   * @param battery {string | Number} The value to check
   * @returns {boolean}
   */
  isValidBattery: function (battery) {
    return this.isValidNumber(battery) && Number(battery) >= 0 && Number(battery) <= 1024;
  },

  /**
   * Checks if a value is valid gps status
   * @function isValidGpsStatus
   * @param gps {string | Number} The value to check
   * @returns {boolean}
   */
  isValidGPSStatus: function (gps) {
    return this.isInteger(gps) && this.isPositiveNumber(gps);
  },

  /**
   * Checks if value is a valid airspeed (Allows negative for up to -2m/s)
   * @param airspeed
   * @returns {boolean}
   */
  isValidAirspeed: function(airspeed){
    return this.isValidNumber(airspeed) && Number(airspeed) > -2;
  }
};

module.exports = Validator;