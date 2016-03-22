//a singleton that managers status codes, whether they be from the connection or picpilot
var STATUS_MAP=require('./models/StatusMap');
var util=require('util');
var EventEmitter = require('events');

//Priorities: 0- High and Bad, 1- High and Good, 2- Medium, 3- Minor 
var StatusManager=function(){
  this.statuses=[];

  // Initialize necessary properties from `EventEmitter` in this instance
  EventEmitter.call(this);

  this.setStatusCode=function(code, status){
    if(STATUS_MAP[code]!==undefined && STATUS_MAP[code].status!==status){ //if the status code exists and its a different status
      if(STATUS_MAP[code].status){
        STATUS_MAP[code].status=false;
        this.removeStatus(STATUS_MAP[code].message,STATUS_MAP[code].priority,0);
        for(var i=0;i<STATUS_MAP[code].turn_off.length;i++){
          var selected_code=STATUS_MAP[code].turn_off[i];
          selected_code.status=false;
          this.removeStatus(selected_code.message,selected_code.priority,0);
        }
      }
      else{
        STATUS_MAP[code].status=true;
        this.addStatus(STATUS_MAP[code].message,STATUS_MAP[code].priority,0);
        for(var i=0;i<STATUS_MAP[code].turn_on.length;i++){
          var selected_code=STATUS_MAP[code].turn_on[i];
          selected_code.status=true;
          this.addStatus(selected_code.message,selected_code.priority,0);
        }
      }
    }
  };

  //message is a string, priority and timeouts are ints
  //priority=1 is high priority, priority=2 is medium priority, priority=3 is low priority
  //timeout is in milliseconds and if it is set to 0 that means there is no timeout (the message will last forever until the user manually clears it)
  this.addStatus=function(message,priority,timeout){
    if((priority===0 || priority===1 || priority===2 || priority===3) && typeof timeout==='number'){
      this.emit('new_status',message,priority,timeout);
      this.statuses.push({
        message: message,
        priority:priority,
        timeout:timeout
      });
      if(timeout!==0){
        setTimeout(function(){
          this.removeStatus(message,priority,timeout);
        }.bind(this),timeout);
      }
    }
    else{
      throw new Error('Please assign an integer priority (1,2, or 3) and timeout to the status');
    }
  };

  //removes a specific timeout message based on its message, priority, and timeout
  //returns true if successful
  this.removeStatus=function(message,priority,timeout){
    var removed=false;
    for(var i=0;i<this.statuses.length;i++){
      if(this.statuses[i].message===message && this.statuses[i].priority===priority && this.statuses[i].timeout===timeout){
        this.emit('remove_status',this.statuses[i].message,this.statuses[i].priority,this.statuses[i].timeout);
        this.statuses.splice(i,1); //deletes the element
        removed=true;
        i--;//to account for the splice since it shrinks the array length by one
      }
    }
    return removed;
  };

  //removes a status based on its timeout (useful for removing all persistent status messages)
  //returns true if successful
  this.removeStatusesByTimeout=function(timeout){
    var removed=false;
    for(var i=0;i<this.statuses.length;i++){
      if(this.statuses[i].timeout===timeout){
        this.emit('remove_status',this.statuses[i].message,this.statuses[i].priority,this.statuses[i].timeout);
        this.statuses.splice(i,1); //deletes the element
        removed=true;
        i--; //to account for the splice
      }
    }
    return removed;
  };
};

util.inherits(StatusManager,EventEmitter);

var status=new StatusManager();
status.setMaxListeners(30); //arbitrary but just in case

module.exports=status;

