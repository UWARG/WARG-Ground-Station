var TelemetryData=require('./models/TelemetryData');
var StatusManager=require('./StatusManager');
var Bitmask=require('./util/Bitmask');
var Validator=require('./util/Validator');
var Logger=require('./util/Logger');

var AircraftStatus=function(){
	this.killModeActive=false;
	this.manualMode=false;
  this.xbee={//has not been implemented yet from the picpilots side
    status:false,
    timeSinceLost:null
  };
  this.gps={
    status: false,
    timeSinceLost: null
  };
  this.uhf={
    status: false,
    timeSinceLost: null
  };

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
    this.checkErrorCodes(data.errorCodes);
    this.checkGPS(data.gpsStatus);
    this.checkManualMode(data.editing_gain);
	}.bind(this));

  this.checkManualMode=function(data){
    var number=Number(data);
    if(!Validator.isInteger(number)){
      Logger.warn('Invalid value for editing_gain received. Value: '+data);
    }
    else{
      this.manualMode= (number===0);
      StatusManager.setStatusCode('MANUAL_MODE',this.manualMode);
    }
  };

  this.checkGPS=function(data){
    var number=Number(data);
    if(!Validator.isInteger(number)){
      Logger.warn('Invalid GPS status received. Status: '+data);
    }
    var connection_status=((number & 0xf0) >> 4)>0; // if theres at least 1 fix
    if (connection_status !== this.gps.status){ //if its a different status
      this.gps.status=connection_status;
      StatusManager.setStatusCode('GPS_LOST',!this.gps.status);
      if(this.gps.status===false){ //if it was set to false, start the timer
        this.gps.timeSinceLost=Date.now();
      }
      else{
        this.gps.timeSinceLost=null;
      }
    } 
  };

  this.checkErrorCodes=function(data){
    var dataNumber=Number(data);
    if(!Validator.isInteger(dataNumber)){
      Logger.warn('Invalid data value for errorCodes received. Value : '+data);
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

      if(this.uhf.status!==error_codes.getBit(16)){
        this.uhf.status=error_codes.getBit(16);
        if(this.uhf.status){ //has been turned to true
          this.uhf.timeSinceLost=null;
        }
        else{ //has been turned to false
          this.uhf.timeSinceLost=Date.now();
        }
      }

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
  }
};

module.exports=new AircraftStatus();