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
    'pitch': 'isValidPitch',
    'roll': 'isValidRoll',
    'yaw': 'isValidYaw',
    'pitch_rate': 'isValidNumber',
    'roll_rate': 'isValidNumber',
    'yaw_rate': 'isValidNumber',
    'airspeed': 'isValidAirspeed',
    'ground_speed': 'isValidSpeed',
    'heading': 'isValidHeading',
    'altitude': 'isValidAltitude',
    'gps_time': 'isValidTime',
    'sys_time': 'isValidTime'
  },

  aircraft_gains: {
    'roll_rate_kp': 'isValidNumber',
    'roll_rate_kd': 'isValidNumber',
    'roll_rate_ki': 'isValidNumber',
    'pitch_rate_kp': 'isValidNumber',
    'pitch_rate_kd': 'isValidNumber',
    'pitch_rate_ki': 'isValidNumber',
    'yaw_rate_kp': 'isValidNumber',
    'yaw_rate_kd': 'isValidNumber',
    'yaw_rate_ki': 'isValidNumber',
    'roll_angle_kp': 'isValidNumber',
    'roll_angle_kd': 'isValidNumber',
    'roll_angle_ki': 'isValidNumber',
    'pitch_angle_kp': 'isValidNumber',
    'pitch_angle_kd': 'isValidNumber',
    'pitch_angle_ki': 'isValidNumber',
    'heading_kp': 'isValidNumber',
    'heading_ki': 'isValidNumber',
    'altitude_kp': 'isValidNumber',
    'altitude_ki': 'isValidNumber',
    'ground_speed_kp': 'isValidNumber',
    'ground_speed_ki': 'isValidNumber',
    'path_kp': 'isValidNumber',
    'orbit_kp': 'isValidNumber'
  },

  aircraft_setpoints:{
    'roll_rate_setpoint': 'isValidNumber',
    'pitch_rate_setpoint': 'isValidNumber',
    'yaw_rate_setpoint': 'isValidNumber',
    'roll_setpoint': 'isValidRoll',
    'pitch_setpoint': 'isValidPitch',
    'heading_setpoint': 'isValidHeading',
    'altitude_setpoint': 'isValidAltitude',
    'throttle_setpoint': 'isValidThrottle'
  },

  aircraft_status: {
    'internal_battery_voltage': 'isValidBattery',
    'external_battery_voltage': 'isValidBattery',
    'program_state': ['isPositiveNumber', 'isInteger'],
    'autonomous_level': ['isPositiveNumber', 'isInteger'],
    'startup_errors': ['isPositiveNumber', 'isInteger'],
    'am_interchip_errors': ['isPositiveNumber', 'isInteger'],
    'pm_interchip_errors': ['isPositiveNumber', 'isInteger'],
    'gps_communication_errors': ['isPositiveNumber', 'isInteger'],
    'peripheral_status':  ['isPositiveNumber', 'isInteger'],
    'uhf_channel_status':  ['isPositiveNumber', 'isInteger'],
    'waypoint_index': ['isPositiveNumber', 'isInteger'],
    'waypoint_count': ['isPositiveNumber', 'isInteger'],
  },

  aircraft_channels: {
    'ch1_in': 'isInteger',
    'ch2_in': 'isInteger',
    'ch3_in': 'isInteger',
    'ch4_in': 'isInteger',
    'ch5_in': 'isInteger',
    'ch6_in': 'isInteger',
    'ch7_in': 'isInteger',
    'ch8_in': 'isInteger',
    'ch1_out': 'isInteger',
    'ch2_out': 'isInteger',
    'ch3_out': 'isInteger',
    'ch4_out': 'isInteger',
    'ch5_out': 'isInteger',
    'ch6_out': 'isInteger',
    'ch7_out': 'isInteger',
    'ch8_out': 'isInteger',
    'channels_scaled': 'isBooleanInt'
  },

  radio_status: {
      'ul_rssi': 'isValidNumber',
      'ul_receive_errors': 'isValidNumber',
      'dl_transmission_errors': 'isValidNumber',
      'dl_rssi': 'isValidNumber',
      'uhf_rssi': 'isValidNumber',
      'uhf_link_quality': 'isValidNumber',
  }
};

module.exports = PacketTypes;


