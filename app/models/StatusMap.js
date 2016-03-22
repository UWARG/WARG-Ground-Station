//Hardcoded status codes used by the status manager
//Priorities: 0- High and Bad, 1- High and Good, 2- Medium, 3- Minor 
module.exports={
  'CONNECTED_DATA_RELAY':{
    status: false,
    message: 'Connected to Data Relay',
    turn_on: [],
    turn_off: ['DISCONNECTED_DATA_RELAY','TIMEOUT_MULTI_ECHO'],
    priority: 1
  },
  'DISCONNECTED_DATA_RELAY':{
    status: false,
    message: 'Disconnected from data_relay',
    turn_on: [],
    turn_off: ['CONNECTED_DATA_RELAY','TIMEOUT_DATA_RELAY'],
    priority: 0
  },
  'TIMEOUT_DATA_RELAY':{
    status: false,
    message:'No data received or sent on data_relay (timeout)',
    turn_on: [],
    turn_off: [],
    priority: 0
  },
  'CONNECTED_MULTI_ECHO':{
    status: false,
    message: 'Connected to Multiecho',
    turn_on: [],
    turn_off: ['DISCONNECTED_MULTI_ECHO','TIMEOUT_MULTI_ECHO'],
    priority: 1
  },
  'DISCONNECTED_MULTI_ECHO':{
    status: false,
    message: 'Disconnected from multi_echo',
    turn_on: [],
    turn_off: ['CONNECTED_DATA_RELAY','TIMEOUT_DATA_RELAY'],
    priority: 0
  },
  'TIMEOUT_MULTI_ECHO':{
    status: false,
    message:'No data received or sent on multi_echo (timeout)',
    turn_on: [],
    turn_off: [],
    priority: 0
  },
  'UHF_LOST':{
  	status: false,
  	message: 'UHF Connection Lost',
  	turn_on: [],
  	turn_off:[],
  	priority: 0
  },
  'AIRCRAFT_KILL_MODE':{
  	status: false,
  	message: 'Aircraft is in KILL MODE',
  	turn_on:[],
  	turn_off: [],
  	priority: 0
  },
  'SIMULATION_ACTIVE':{
  	status: false,
  	message: 'Simulation Mode',
  	turn_on:[],
  	turn_off: [],
  	priority: 1
  },
  'MANUAL_MODE':{
  	status: false,
  	message: 'Manual Mode On',
  	turn_on:[],
  	turn_off: [],
  	priority:1
  },
  'AIRCRAFT_ERROR_POWER_ON_RESET':{
  	status: false,
  	message: 'Error: Power on Reset',
  	turn_on:[],
  	turn_off: [],
  	priority:0
  },
  'AIRCRAFT_ERROR_BROWN_OUT_RESET':{
  	status: false,
  	message: 'Error: Brown Out Reset',
  	turn_on:[],
  	turn_off: [],
  	priority:0
  },
  'AIRCRAFT_ERROR_IDLE_MODE_RESET':{
  	status: false,
  	message: 'Error: Idle Mode Reset',
  	turn_on:[],
  	turn_off: [],
  	priority:0
  },
  'AIRCRAFT_ERROR_SLEEP_MODE':{
  	status: false,
  	message: 'Error: Sleep Mode Reset',
  	turn_on:[],
  	turn_off: [],
  	priority:0
  },
  'AIRCRAFT_ERROR_SOFTWARE_WATCH_DOG_RESET':{
  	status: false,
  	message: 'Error: Software Watch Dog Timer Reset',
  	turn_on:[],
  	turn_off: [],
  	priority:0
  },
  'AIRCRAFT_ERROR_SOFTWARE_RESET':{
  	status: false,
  	message: 'Error: Software Reset',
  	turn_on:[],
  	turn_off: [],
  	priority:0
  },
  'AIRCRAFT_ERROR_EXTERNAL_RESET':{
  	status: false,
  	message: 'Error: External Reset',
  	turn_on:[],
  	turn_off: [],
  	priority:0
  },
  'AIRCRAFT_ERROR_VOLTAGE_REGULATOR_RESET':{
  	status: false,
  	message: 'Error: Voltage Regulator Reset',
  	turn_on:[],
  	turn_off: [],
  	priority:0
  },
  'AIRCRAFT_ERROR_ILLEGAL_OPCODE_RESET':{
  	status: false,
  	message: 'Error: Illegal Opcode Reset',
  	turn_on:[],
  	turn_off: [],
  	priority:0
  },
  'AIRCRAFT_ERROR_TRAP_RESET':{
  	status: false,
  	message: 'Error: Trap Reset',
  	turn_on:[],
  	turn_off: [],
  	priority:0
  }
};