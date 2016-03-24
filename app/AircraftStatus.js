var TelemetryData=require('./models/TelemetryData');
var StatusManager=require('./StatusManager');

var BitMask=require('bit-mask');

var AircraftStatus=function(){
	this.killModeActive=false;
	this.uhfStatus=false;
	this.manualMode=false;

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
	
	TelemetryData.on('data_received',function(data){
		var error_codes=new BitMask(data.errorCodes,10);
    //checks if the new status is different from what was already stored, and if so, sends the error to the status manager
		if(error_codes.getBit(0)!=this.startup_errors.POWER_ON_RESET){ //power on reset occured
      this.startup_errors.POWER_ON_RESET=Boolean(error_codes.getBit(0));
      StatusManager.setStatusCode('AIRCRAFT_ERROR_POWER_ON_RESET',this.startup_errors.POWER_ON_RESET);
		}
		if(error_codes.getBit(1)!=this.startup_errors.BROWN_OUT_RESET){ //brown out reset occured
      this.startup_errors.BROWN_OUT_RESET=Boolean(error_codes.getBit(1));
      StatusManager.setStatusCode('AIRCRAFT_ERROR_BROWN_OUT_RESET',this.startup_errors.BROWN_OUT_RESET);
		}
		if(error_codes.getBit(2)!=this.startup_errors.IDLE_MODE_RESET){ //idle mode reset occured
      this.startup_errors.IDLE_MODE_RESET=Boolean(error_codes.getBit(2));
      StatusManager.setStatusCode('AIRCRAFT_ERROR_IDLE_MODE_RESET',this.startup_errors.IDLE_MODE_RESET);
		}
		if(error_codes.getBit(3)!=this.startup_errors.SLEEP_MODE_RESET){ //sleep mode reset occured
      this.startup_errors.SLEEP_MODE_RESET=Boolean(error_codes.getBit(3));
      StatusManager.setStatusCode('AIRCRAFT_ERROR_SLEEP_MODE_RESET',this.startup_errors.SLEEP_MODE_RESET);
		}
		if(error_codes.getBit(4)!=this.startup_errors.SOFTWARE_WATCH_DOG_RESET){ //software watch dog timer reset occured
      this.startup_errors.SOFTWARE_WATCH_DOG_RESET=Boolean(error_codes.getBit(4));
      StatusManager.setStatusCode('AIRCRAFT_ERROR_SOFTWARE_WATCH_DOG_RESET',this.startup_errors.SOFTWARE_WATCH_DOG_RESET);
		}
		if(error_codes.getBit(5)!=this.startup_errors.SOFTWARE_RESET){ //software reset occured
      this.startup_errors.SOFTWARE_RESET=Boolean(error_codes.getBit(5));
      StatusManager.setStatusCode('AIRCRAFT_ERROR_SOFTWARE_RESET',this.startup_errors.SOFTWARE_RESET);
		}
		if(error_codes.getBit(6)!=this.startup_errors.EXTERNAL_RESET){ //external reset occured
      this.startup_errors.EXTERNAL_RESET=Boolean(error_codes.getBit(6));
      StatusManager.setStatusCode('AIRCRAFT_ERROR_EXTERNAL_RESET',this.startup_errors.EXTERNAL_RESET);
		}
		if(error_codes.getBit(7)!=this.startup_errors.VOLTAGE_REGULATOR_RESET){ //voltage regulator reset occured
      this.startup_errors.VOLTAGE_REGULATOR_RESET=Boolean(error_codes.getBit(7));
      StatusManager.setStatusCode('AIRCRAFT_ERROR_VOLTAGE_REGULATOR_RESET',this.startup_errors.VOLTAGE_REGULATOR_RESET);
		}
		if(error_codes.getBit(8)!=this.startup_errors.ILLEGAL_OPCODE_RESET){ //illegal opcode reset occured
      this.startup_errors.ILLEGAL_OPCODE_RESET=Boolean(error_codes.getBit(8));
      StatusManager.setStatusCode('AIRCRAFT_ERROR_ILLEGAL_OPCODE_RESET',this.startup_errors.ILLEGAL_OPCODE_RESET);
		}
		if(error_codes.getBit(9)!=this.startup_errors.TRAP_RESET){ //trap reset occured
      this.startup_errors.TRAP_RESET=Boolean(error_codes.getBit(9));
      StatusManager.setStatusCode('AIRCRAFT_ERROR_TRAP_RESET',this.startup_errors.TRAP_RESET);
		}
		if(error_codes.getBit(16)!=this.uhfStatus){ //uhf switch is on
      this.uhfStatus=Boolean(error_codes.getBit(16));
      StatusManager.setStatusCode('UHF_LOST',!this.uhfStatus);
		}	
	}.bind(this));
};

module.exports=new AircraftStatus();