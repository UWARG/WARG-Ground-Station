// An singleton that contains and manages the sending of picpilot commands
var picpilot_config=require('../../config/picpilot-config');
var Network=require('../Network');
var Logger=require('../util/Logger');
var Validator=require('../util/Validator');
var SimulationManager=require("../SimulationManager");
var AircraftStatus=require('../AircraftStatus');
var Coordinates=require('../models/Coordinates');

var Commands={
  checkConnection: function(){ //to make sure the data relay connection exists first (otherwise we'll prob get weird errors)
    if(SimulationManager.simulationActive){ //just return false if the simulation is active
      return false;
    }

    if(Network.connections['data_relay'] && !Network.connections['data_relay'].closed){
      return true;
    }
    else{
      Logger.warn('Cannot send command as the data_relay connection has not yet been established or the connection is closed');
      return false;
    }
  },
  sendProtectedCommand:function(command){
    if(this.checkConnection()){
      Network.connections['data_relay'].write(command+':'+picpilot_config.get('command_password')+'\r\n');
      return true;
    }
    if(SimulationManager.simulationActive){
      Logger.info('[Simulation] Successfully sent command '+command+':'+picpilot_config.get('command_password')+'\r\n');
      return true;
    }
    return false;
  },
  sendCommand: function(command, value){ //value can be an indefinte number of arguments
    var value_string='';
    for(var arg=1;arg<arguments.length-1;arg++){ //we start at one cause we only care about the values
      value_string+=arguments[arg]+',';
    };
    value_string+=arguments[arguments.length-1];

    if(this.checkConnection()){
      Network.connections['data_relay'].write(command+':'+value_string+'\r\n');
      return true;
    }
    if(SimulationManager.simulationActive){
      Logger.info('[Simulation] Successfully sent command '+command+':'+value_string+'\r\n');
      return true;
    }
    return false;
  },
  sendRawCommand: function(command){  
    if(this.checkConnection()){
      Network.connections['data_relay'].write(command+'\r\n');
      return true;
    }
    if(SimulationManager.simulationActive){
      Logger.info('[Simulation] Successfully sent command: '+command);
      return true;
    }
    return false;
  },
  activateWriteMode: function(){
    this.sendRawCommand('commander');
  },
  sendRoll: function(roll){
    if(Validator.isValidRoll(roll)){
      this.sendCommand('set_rollAngle',roll);
    }
    else{
      Logger.error('Command to not sent since invalid roll value detected! Roll:'+roll);
    }
  },
  sendPitch: function(pitch){
    if(Validator.isValidPitch(pitch)){
      this.sendCommand('set_pitchAngle',pitch);
    }
    else{
      Logger.error('Command to not sent since invalid pitch value detected! Pitch:'+pitch);
    }
  },
  sendHeading: function(heading){
    if(Validator.isValidHeading(heading)){
      this.sendCommand('set_heading',heading);
    }
    else{
      Logger.error('Command to not sent since invalid heading value detected! Heading:'+heading);
    }
  },
  sendAltitude:function(altitude){
    if(Validator.isValidAltitude(altitude)){
      this.sendCommand('set_altitude',altitude);
    }
    else{
      Logger.error('Command to not sent since invalid altitude value detected! Altitude:'+altitude);
    }
  },
  sendThrottle:function(throttle){
    if(Validator.isValidPercentage(throttle)){
      this.sendCommand('set_throttle',(Number(throttle)*2048/100-1024).toFixed(0));
    }
    else{
      Logger.error('Command to not sent since invalid throttle value detected! Throttle:'+throttle);
    }
  },
  sendFlap:function(flap){
    if(Validator.isValidPercentage(flap)){
      this.sendCommand('set_flap',(Number(flap)*2048/100-1024).toFixed(0));
    }
    else{
      Logger.error('Command to not sent since invalid flap value detected! Flap Setpoint:'+flap);
    }
  },
  sendKPGain: function(type,gain){
    if(Validator.isValidNumber(gain)){
      this.sendCommand('set_'+type+'KPGain',gain);
    }
    else{
      Logger.error('Command to not sent since invalid gain value detected! Gain value:'+gain);
    }
  },
  sendKIGain: function(type, gain){
    if(Validator.isValidNumber(gain)){
      this.sendCommand('set_'+type+'KIGain',gain);
    }
    else{
      Logger.error('Command to not sent since invalid gain value detected! Gain value:'+gain);
    }
  },
  sendKDGain: function(type, gain){
    if(Validator.isValidNumber(gain)){
      this.sendCommand('set_'+type+'KDGain',gain);
    }
    else{
      Logger.error('Command to not sent since invalid gain value detected! Gain value:'+gain);
    }
  },
  sendPathGain: function(gain){
    if(Validator.isValidNumber(gain)){
      this.sendCommand('set_pathGain',gain);
    }
    else{
      Logger.error('Command to not sent since invalid path gain value detected! Gain value:'+gain);
    }
  },
  sendOrbitGain: function(gain){
    if(Validator.isValidNumber(gain)){
      this.sendCommand('set_orbitGain',gain);
    }
    else{
      Logger.error('Command to not sent since invalid orbit gain value detected! Gain value:'+gain);
    }
  },
  showGain: function(value){
    if(Validator.isValidNumber(value)){
      this.sendCommand('set_showGain',value);
    }
    else{
      Logger.error('Command to not sent since invalid show gain value detected! Value:'+value);
    }
  },
  sendAutoLevel: function(level){
    if(Validator.isValidNumber(level)){
      this.sendCommand('set_autonomousLevel', level);
    }
    else{
      Logger.error('Command not sent since invalid autonomous level value detected! Value: '+level);
    }
  },
  armPlane: function(){
    this.sendProtectedCommand('arm_vehicle');
  },
  disarmPlane: function(){
    this.sendProtectedCommand('dearm_vehicle');
  },
  killPlane: function(){
    this.sendProtectedCommand('kill_plane');
  },
  unkillPlane: function(){
    this.sendProtectedCommand('unkill_plane');
  },
  dropProbe: function(number){
    this.sendCommand('drop_probe',number);
  },
  resetProbe: function(number){
    this.sendCommand('reset_probe',number);
  },
  clearWaypoints: function(){
    this.sendCommand('clear_waypoints',1);
  },
  setTargetWaypoint: function(number){
    if(Validator.isValidNumber(number)){
      this.sendCommand('set_targetWaypoint', number);
    }
    else{
      Logger.error('setTargetWaypoint command not since invalid waypoint number was passed in. Number: '+number);
    }
  },
  removeWaypoint: function(number){
    if(Validator.isValidNumber(number)){
      this.sendCommand('remove_waypoint', number);
    }
    else{
      Logger.error('removeWaypoint command not since invalid waypoint number was passed in. Number: '+number);
    }
  },
  returnHome: function(){
    this.sendCommand('return_home',1);
  },
  cancelReturnHome: function(){
    this.sendCommand('cancel_returnHome',1);
  },
  setReturnHome: function(coordinates){
    var coords=Coordinates(coordinates);
    if(coords && coords.alt){
      this.sendCommand('set_ReturnHomeCoordinates',coords.lat, coords.lng, coords.alt);
    }
    else{
      Logger.error('setReturnHome command not since invalid coordinates were passed in. Coordinates: '+coordinates);
    }
  },
  appendWaypoint: function(coordinates, radius, probe_drop){
    var coords=Coordinates(coordinates);
    if(coords && coords.alt && Validator.isValidNumber(radius)){
      this.sendCommand('new_waypoint',coords.lat,coords.lng,coords.alt,radius,probe_drop*1);
    }
    else{
      Logger.error('appendWaypoint command not since invalid coordinates were passed in. Coordinates: '+coordinates);
    }
  },
  insertWaypoint: function(index,coordinates, radius){
    var coords=Coordinates(coordinates);
    if(Validator.isInteger(index) && coords && coords.alt && Validator.isValidNumber(radius)){
      this.sendCommand('insert_Waypoint',coords.lat, coords.lng, coords.alt, radius, index-1, index+1);
    }
    else{
      Logger.error('insertWaypoint command not since invalid waypoint number or coordinates were passed in. Index: '+index);
    }
  },
  updateWaypoint: function(index, coordinates, radius, probe_drop){
    var coords=Coordinates(coordinates);
    if(Validator.isInteger(index) && coords && coords.alt && Validator.isValidNumber(radius)){
      this.sendCommand('update_waypoint',coords.lat, coords.lng, coords.alt, radius, probe_drop*1,index);
    }
    else{
      Logger.error('updateWaypoint command not since invalid waypoint number or coordinates were passed in. Index: '+index);
    }
  },
  followPath: function(status){
    if(status){
      this.sendCommand('follow_path',1);
    } 
    else{
      this.sendCommand('follow_path',0);
    }
  },
  setTargetWaypoint: function(index){
    if(!isNaN(index)){
      this.sendCommand('set_targetWaypoint', index);
    }
  },
  sendHeartbeat: function(){
    if(this.sendCommand('send_heartbeat',1)){
      Logger.debug('[HEARTBEAT] Sent heartbeat to the picpilot');
    }
  },
  returnHome: function(){
    this.sendCommand('return_home',1);
  },
  cancelReturnHome: function(){
    this.sendCommand('cancel_returnHome',1);
  }
};
module.exports=Commands;