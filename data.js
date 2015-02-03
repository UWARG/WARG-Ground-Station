var Data = {
	headers: [],	// Title of each column of data received
	state: {},		// Current flight state
	history: [],	// All past flight states
	localWaypoints: [],	// List of waypoints we're working on
	remoteWaypoints: [],// List of waypoints we've uploaded
};

/*
headers:
	lat, lon, time, pitch, roll, yaw, pitch_rate, roll_rate, yaw_rate,
	kd_gain, kp_gain, ki_gain, ground_speed, altitude, heading,
	pitch_setpoint, roll_setpoint, heading_setpoint, throttle_setpoint,
	altitude_setpoint, int_pitch_setpoint, int_roll_setpoint, int_yaw_setpoint,
	lastCommandSent, errorCodes, cameraStatus, waypointIndex, editing_gain, gpsStatus
*/