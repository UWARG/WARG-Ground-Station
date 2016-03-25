var TelemetryData=require('./models/TelemetryData');
var StatusManager=require('./StatusManager');

var Bitmask=require('./util/Bitmask');
var Validator=require('./util/Validator');

var AircraftStatus=function(){
	this.killModeActive=false;
	this.uhfStatus=false;
	this.manualMode=false;

  this.pastErrorCode=null;
	this.startup_errors={
		POWER_ON_RESET: false,
		BROWN_OUT_RESET: false,
		IDLE_MODE_RESET: false,
		SLEEP_MODE_RESET: false,
		SOFTWARE_WATCH_DOG_RESET: false,
		SOFTWARE_RESET: false,
		EXTERNAL_RESET: false,
		VOLTAGE_REGULATOR_RESET: false,
		ILLEGAL_OPCODE_RESET: false,
		TRAP_RESET: false
	};
	
	TelemetryData.on('data_received',function(data){//what happens when the data stream is corrupted?
    var dataNumber=Number(data.errorCodes);
    if(!Validator.isInteger(dataNumber)){
      Logger.warn('Invalid data value for errorCodes received. Value : '+data.errorCodes);
    }
    else if(this.pastErrorCode!==dataNumber){ //if we got an error code value thats different from last time
      var error_codes=new Bitmask(dataNumber,10);
      this.pastErrorCode=dataNumber;

      this.startup_errors.POWER_ON_RESET=error_codes.getBit(0);
      this.startup_errors.BROWN_OUT_RESET=error_codes.getBit(1);
      this.startup_errors.IDLE_MODE_RESET=error_codes.getBit(2);
      this.startup_errors.SLEEP_MODE_RESET=error_codes.getBit(3);
      this.startup_errors.SOFTWARE_WATCH_DOG_RESET=error_codes.getBit(4);
      this.startup_errors.SOFTWARE_RESET=error_codes.getBit(5);
      this.startup_errors.EXTERNAL_RESET=error_codes.getBit(6);
      this.startup_errors.VOLTAGE_REGULATOR_RESET=error_codes.getBit(7);
      this.startup_errors.ILLEGAL_OPCODE_RESET=error_codes.getBit(8);
      this.startup_errors.TRAP_RESET=error_codes.getBit(9);
      this.uhfStatus=error_codes.getBit(16);

      StatusManager.setStatusCode('AIRCRAFT_ERROR_POWER_ON_RESET',this.startup_errors.POWER_ON_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_BROWN_OUT_RESET',this.startup_errors.BROWN_OUT_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_IDLE_MODE_RESET',this.startup_errors.IDLE_MODE_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_SLEEP_MODE_RESET',this.startup_errors.SLEEP_MODE_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_SOFTWARE_WATCH_DOG_RESET',this.startup_errors.SOFTWARE_WATCH_DOG_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_SOFTWARE_RESET',this.startup_errors.SOFTWARE_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_EXTERNAL_RESET',this.startup_errors.EXTERNAL_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_VOLTAGE_REGULATOR_RESET',this.startup_errors.VOLTAGE_REGULATOR_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_ILLEGAL_OPCODE_RESET',this.startup_errors.ILLEGAL_OPCODE_RESET);
      StatusManager.setStatusCode('AIRCRAFT_ERROR_TRAP_RESET',this.startup_errors.TRAP_RESET);
      StatusManager.setStatusCode('UHF_LOST',!this.uhfStatus);
    }
	}.bind(this));
};

module.exports=new AircraftStatus();