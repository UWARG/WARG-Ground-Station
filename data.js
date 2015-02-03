var Data = {
	headers: [],	// Title of each column of data received
	state: {},		// Current flight state
	history: [],	// All past flight states
};

/*
headers (in order):
	lat, lon,			// degrees
	time,				// hhmmss (float, decimals are fractions of a second)
	pitch, roll, yaw,	// rad ?
	pitch_rate, roll_rate, yaw_rate,	// rad/s ?
	kd_gain, kp_gain, ki_gain,			// ?
	ground_speed,		// m/s ?
	altitude,			// m ?
	heading,			// degrees
	pitch_setpoint, roll_setpoint, heading_setpoint,			// degrees ?
	throttle_setpoint,	// ?
	altitude_setpoint,	// m ?
	int_pitch_setpoint, int_roll_setpoint, int_yaw_setpoint,	// ?
	lastCommandSent,	// ?
	errorCodes,			// ?
	cameraStatus,		// ?
	waypointIndex,		// Index of current waypoint ?
	editing_gain,		// ?
	gpsStatus			// ?

TODO: Could someone check and make sure the units are right?
And explain some of the magic status numbers like lastCommandSent, errorCodes, cameraStatus, gpsStatus etc?
*/