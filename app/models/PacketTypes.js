/**
 * @author Serge Babayan
 * @module models/PacketTypes
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence https://raw.githubusercontent.com/UWARG/WARG-Ground-Station/master/LICENSE
 * @description Contains the different packet types that the TelemetryData module sends out. Also lists the validation
 * function to use for a certain header received from the picpilot.
 * @see http://docs.uwarg.com/picpilot/datalink/
 */

var PacketTypes = {
  aircraft_position: { //this is the event name
    'lat': 'isValidLatitude', //the key is the header name, the value is a function name in the Validator module. Could be an array if you want to use multiple
    'lon': 'isValidLongitude',
    'airspeed': 'isValidAirspeed',
    'ground_speed': 'isValidSpeed',
    'heading': 'isValidHeading',
    'heading_setpoint': 'isValidHeading',
    'altitude': 'isValidAltitude',
    'altitude_setpoint': 'isValidAltitude',
    'throttle_setpoint': 'isValidThrottle',
    'flap_setpoint': 'isValidFlap'
  },

  aircraft_orientation: {
    'pitch': 'isValidPitch',
    'roll': 'isValidRoll',
    'yaw': 'isValidYaw',
    'pitch_rate': 'isValidNumber',
    'roll_rate': 'isValidNumber',
    'yaw_rate': 'isValidNumber',
    'yaw_rate_setpoint': 'isValidNumber',
    'roll_rate_setpoint': 'isValidNumber',
    'roll_setpoint': 'isValidRoll',
    'pitch_rate_setpoint': 'isValidNumber',
    'pitch_setpoint': 'isValidPitch'
  },

  aircraft_gains: {
    'roll_kp': 'isValidNumber',
    'roll_kd': 'isValidNumber',
    'roll_ki': 'isValidNumber',
    'pitch_kp': 'isValidNumber',
    'pitch_kd': 'isValidNumber',
    'pitch_ki': 'isValidNumber',
    'yaw_kp': 'isValidNumber',
    'yaw_kd': 'isValidNumber',
    'yaw_ki': 'isValidNumber',
    'heading_kp': 'isValidNumber',
    'heading_kd': 'isValidNumber',
    'heading_ki': 'isValidNumber',
    'altitude_kp': 'isValidNumber',
    'altitude_kd': 'isValidNumber',
    'altitude_ki': 'isValidNumber',
    'throttle_kp': 'isValidNumber',
    'throttle_kd': 'isValidNumber',
    'throttle_ki': 'isValidNumber',
    'flap_kp': 'isValidNumber',
    'flap_kd': 'isValidNumber',
    'flap_ki': 'isValidNumber',
    'path_gain': 'isValidNumber',
    'orbit_gain': 'isValidNumber'
  },

  aircraft_status: {
    'time': 'isValidTime',
    'sys_time': 'isValidTime',
    'last_command_sent0': ['isPositiveNumber', 'isInteger'],
    'last_command_sent1': ['isPositiveNumber', 'isInteger'],
    'last_command_sent2': ['isPositiveNumber', 'isInteger'],
    'last_command_sent3': ['isPositiveNumber', 'isInteger'],
    'battery_level1': 'isValidBattery',
    'battery_level2': 'isValidBattery',
    'autonomousLevel': ['isPositiveNumber', 'isInteger'],
    'startup_error_codes': ['isPositiveNumber', 'isInteger'],
    'startupSettings': ['isPositiveNumber', 'isInteger'],
    'wireless_connection': ['isPositiveNumber', 'isInteger'],
    'autopilot_active': ['isPositiveNumber', 'isInteger'],
    'gps_status': ['isPositiveNumber', 'isInteger'],
    'camera_status': ['isPositiveNumber', 'isInteger'],
    'waypoint_count': ['isPositiveNumber', 'isInteger'],
    'waypoint_index': ['isPositiveNumber', 'isInteger'],
    'path_following': 'isBooleanInt',
    'path_checksum': 'isPositiveNumber'
  },

  aircraft_channels: {
    'ch1in': 'isInteger',
    'ch2in': 'isInteger',
    'ch3in': 'isInteger',
    'ch4in': 'isInteger',
    'ch5in': 'isInteger',
    'ch6in': 'isInteger',
    'ch7in': 'isInteger',
    'ch8in': 'isInteger',
    'ch1out': 'isInteger',
    'ch2out': 'isInteger',
    'ch3out': 'isInteger',
    'ch4out': 'isInteger',
    'ch5out': 'isInteger',
    'ch6out': 'isInteger',
    'ch7out': 'isInteger',
    'ch8out': 'isInteger'
  },

  radio_status: {
      ul_rssi: 'isValidNumber',
      ul_receive_errors: 'isValidNumber',
      dl_transmission_errors: 'isValidNumber',
      dl_rssi: 'isValidNumber',
      uhf_rssi: 'isValidNumber',
      uhf_link_quality: 'isValidNumber',
  }
};

module.exports = PacketTypes;


