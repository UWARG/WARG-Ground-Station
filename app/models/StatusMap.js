//Hardcoded status codes used by the status manager
//Priorities: 0- High and Bad, 1- High and Good, 2- Medium, 3- Minor 
/*
	A sample status code looks like this:
	'CONNECTED_DATA_RELAY':{ //key of the status code
	    status: false, //the current status of the code
	    message: 'Connected to Data Relay', //default message thats displayed in the StatusBar
	    turn_on_ontrue: [], //which other Status codes should be turned on when the status code is set to TRUE for the first time
	    turn_off_ontrue: ['DISCONNECTED_DATA_RELAY','TIMEOUT_MULTI_ECHO'], //which other Status codes should be turned off when the status code is set to TRUE for the first time
	    turn_on_onfalse:[], //which other Status codes should be turned ON when the status code is set to FALSE for the first time
	    turn_off_onfalse:[], //which other Status codes should be turned OFF when the status code is set to FALSE for the first time
	    priority: 1 //priority of the status code
  	},
*/
module.exports={
  'CONNECTED_DATA_RELAY':{
    status: false,
    message: 'Connected to Data Relay',
    turn_on_ontrue: [],
    turn_off_ontrue: ['DISCONNECTED_DATA_RELAY','TIMEOUT_MULTI_ECHO'],
    turn_on_onfalse:[],
    turn_off_onfalse:[],
    priority: 1,
    timeout: 0
  },
  'DISCONNECTED_DATA_RELAY':{
    status: false,
    message: 'Disconnected from Data Relay',
    turn_on_ontrue: [],
    turn_off_ontrue: ['CONNECTED_DATA_RELAY','TIMEOUT_DATA_RELAY'],
    turn_on_onfalse:[],
    turn_off_onfalse:[],
    priority: 0,
    timeout: 0
  },
  'TIMEOUT_DATA_RELAY':{
    status: false,
    message:'No data received or sent on Data Relay (timeout)',
    turn_on_ontrue: [],
    turn_off_ontrue: [],
    turn_on_onfalse:[],
    turn_off_onfalse:[],
    priority: 0,
    timeout: 0
  },
  'CONNECTED_MULTI_ECHO':{
    status: false,
    message: 'Connected to Multiecho',
    turn_on_ontrue: [],
    turn_off_ontrue: ['DISCONNECTED_MULTI_ECHO','TIMEOUT_MULTI_ECHO'],
    turn_on_onfalse:[],
    turn_off_onfalse:[],
    priority: 1,
    timeout: 0
  },
  'DISCONNECTED_MULTI_ECHO':{
    status: false,
    message: 'Disconnected from Multiecho',
    turn_on_ontrue: [],
    turn_off_ontrue: ['CONNECTED_DATA_RELAY','TIMEOUT_DATA_RELAY'],
    turn_on_onfalse:[],
    turn_off_onfalse:[],
    priority: 0,
    timeout: 0
  },
  'TIMEOUT_MULTI_ECHO':{
    status: false,
    message:'No data received or sent on Multiecho (timeout)',
    turn_on_ontrue: [],
    turn_off_ontrue: [],
    turn_on_onfalse:[],
    turn_off_onfalse:[],
    priority: 0,
    timeout: 0
  },
  'UHF_LOST':{
  	status: false,
  	message: 'UHF Connection Lost',
  	turn_on_ontrue: [],
  	turn_off_ontrue:[],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority: 0,
    timeout: 0
  },
  'GPS_LOST':{
    status: false,
    message: 'GPS Fix Lost',
    turn_on_ontrue: [],
    turn_off_ontrue:[],
    turn_on_onfalse:[],
    turn_off_onfalse:[],
    priority: 0,
    timeout: 0
  },
  'AIRCRAFT_KILL_MODE':{
  	status: false,
  	message: 'Aircraft is in KILL MODE',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority: 0,
    timeout: 0
  },
  'SIMULATION_ACTIVE':{
  	status: false,
  	message: 'Simulation Mode',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority: 1,
    timeout: 0
  },
  'MANUAL_MODE':{
  	status: false,
  	message: 'Manual Mode On',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:1,
    timeout: 0
  },
  'AIRCRAFT_ERROR_POWER_ON_RESET':{
  	status: false,
  	message: 'Startup Error: Power on Reset',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:0,
    timeout: 0
  },
  'AIRCRAFT_ERROR_BROWN_OUT_RESET':{
  	status: false,
  	message: 'Startup Error: Brown Out Reset',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:0,
    timeout: 0
  },
  'AIRCRAFT_ERROR_IDLE_MODE_RESET':{
  	status: false,
  	message: 'Startup Error: Idle Mode Reset',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:0,
    timeout: 0
  },
  'AIRCRAFT_ERROR_SLEEP_MODE_RESET':{
  	status: false,
  	message: 'Startup Error: Sleep Mode Reset',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:0,
    timeout: 0
  },
  'AIRCRAFT_ERROR_SOFTWARE_WATCH_DOG_RESET':{
  	status: false,
  	message: 'Startup Error: Software Watch Dog Timer Reset',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:0,
    timeout: 0
  },
  'AIRCRAFT_ERROR_SOFTWARE_RESET':{
  	status: false,
  	message: 'Startup Error: Software Reset',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:0,
    timeout: 0
  },
  'AIRCRAFT_ERROR_EXTERNAL_RESET':{
  	status: false,
  	message: 'Startup Error: External Reset',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:0,
    timeout: 0
  },
  'AIRCRAFT_ERROR_VOLTAGE_REGULATOR_RESET':{
  	status: false,
  	message: 'Startup Error: Voltage Regulator Reset',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:0,
    timeout: 0
  },
  'AIRCRAFT_ERROR_ILLEGAL_OPCODE_RESET':{
  	status: false,
  	message: 'Startup Error: Illegal Opcode Reset',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:0,
    timeout: 0
  },
  'AIRCRAFT_ERROR_TRAP_RESET':{
  	status: false,
  	message: 'Startup Error: Trap Reset',
  	turn_on_ontrue:[],
  	turn_off_ontrue: [],
  	turn_on_onfalse:[],
    turn_off_onfalse:[],
  	priority:0,
    timeout: 0
  }
};