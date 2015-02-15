var Data = {
	headers: [],	// Title of each column of data received
	state: {},		// Current flight state
	history: [],	// All past flight states (increasing index means more recent)
};

/*
Data Link Output Format Rev.4
=============================

This is only for reference and is not an authoritative source. Specifications may change.
The columns are presented here in no particular order.
(Adapted from: WARG-Ground-Station-V2 pull-request #7)

lat (long double (64bit floating point))
Latitude [°]: The latitude location of the airplane.

lon (long double (64bit floating point))
Longitude [°]: The longitude location of the airplane.

time (float (32 bit floating point))
Time [hhmmss...]: The time as a UTC time stamp.

pitch (float)
Pitch [°]: The current state estimation of the pitch of the aircraft.

roll (float)
Roll [°]: The current state estimation of the roll of the aircraft.

yaw (float)
Yaw [°]: The current state estimation of the yaw of the aircraft according to the magnetometer.

pitch_rate (float)
Pitch Rate [rad/s]: The gyroscope sensor data. The rate of rotation of the aircraft.

roll_rate (float)
Roll Rate [rad/s]: The gyroscope sensor data. The rate of rotation of the aircraft.

yaw_rate (float)
Yaw Rate [rad/s]: The gyroscope sensor data. The rate of rotation of the aircraft.

kd_gain (float)
Derivative Gain [unitless]: A predetermined gain value for a PID loop. Typically used for tuning and debugging purposes.

kp_gain (float)
Proportional Gain [unitless]: A predetermined gain value for a PID loop. Typically used for tuning and debugging purposes.

ki_gain (float)
Integral Gain [unitless]: A predetermined gain value for a PID loop. Typically used for tuning and debugging purposes.

ground_speed (float)
Ground Speed [m/s]: The ground speed of the aircraft.

altitude (float)
Altitude: The altitude of the plane above the mean sea level (in meters)

heading (float)
Heading [°]: The GPS heading of the aircraft in degrees ranging from 0 to 360.

pitch_setpoint (float)
Pitch Setpoint [°]: The autopilot-controlled setpoint for the pitch angle.

roll_setpoint (float)
Roll Setpoint [°]: The autopilot-controlled setpoint for the Roll angle.

heading_setpoint (float)
Heading Setpoint [°]: The autopilot-controlled setpoint for the heading angle.

throttle_setpoint (float)
Throttle Setpoint [%]: The autopilot-controlled setpoint for the propeller speed in terms of percentage (0-100%)

altitude_setpoint (float)
Altitude Setpoint [m]: The autopilot-controlled setpoint for the altitude above mean sea level.

int_pitch_setpoint (float)
Pitch Setpoint (Controller) [CPU timer2 ticks]: The user input for the Pitch angle in arbitrary timer tick units.

int_roll_setpoint (float)
Roll Setpoint(Controller) [CPU timer2 ticks]: The user input for the Roll angle in arbitrary timer tick units.

int_yaw_setpoint (float)
Yaw Setpoint (Controller) [CPU timer2 ticks]: The user input for the yaw angle in arbitrary timer tick units.

lastCommandSent (int)
Last Wireless Command Sent & Received: This is a combination of the command number (commands.h) multiplied by 100. For every subsequent call, the number is incremented by 1. For example, if the return home command was called 5 times, this variable would be equal to 4105

errorCodes (unsigned int)
Error Code: Signals any problems that may be occurring or have occurred.This value is retrieved from StartupErrorCodes.c. The possible values are (and any binary combination):
0b0000000000000000: No Errors
0b0000000000000001: Power on reset occurred.
0b0000000000000010: Brown out reset occurred.
0b0000000000000100: Idle Mode Reset Occurred.
0b0000000000001000: Sleep Mode Reset Occurred.
0b0000000000010000: Software Watch Dog Timer Reset Occurred.
0b0000000000100000: Software Reset Occurred.
0b0000000001000000: External Reset Occurred.
0b0000000010000000: Voltage Regulator Reset Occurred.
0b0000000100000000: Illegal Opcode Reset Occurred.
0b0000001000000000: Trap Reset Occurred.
0b1000000000000000: UHF Switch is ON (Can be used to indicate joystick controller connection)

(?) cameraCounter (unsigned int)
Camera Counter: Every time the camera is triggered, this value increases by one. This allows one to keep track which picture corresponds to what data.

waypointIndex (char)
Waypoint Index: Indicates what waypoint the vehicle is attempting to get to.
(?) -1: indicates that the vehicle is going "HOME"
Any other value indicates the waypoint in the order that it was added.

editing_gain (char)
Controller Status Indicator: An indicator that depicts which gain values are currently being changed.
0x00: Manual Mode
0x01: Yaw
0x02: Pitch
0x03: Roll
0x04: Heading
0x05: Altitude
0x06: Throttle

gps_status (char)
GPS Status Indicator: An indicator that depicts the number of satellites connected, as well as the status of the gps fix. Format: 0x
For example:
0x00 = No GPS Fix, 0 Satellites
0x1A = GPS Fix, 10 Satellites
0x24 = DGPS Fix, 4 Satellites 

batteryLevel (char) (?)
Battery Level Indicator [%]: This indicator provides the battery level as a percentage (%) of the original battery capacity specified in the voltageSensor.c/h files.
*/