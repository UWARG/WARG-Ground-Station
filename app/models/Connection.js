var net = require('net');
var util=require('util');
var EventEmitter = require('events');
var Logger=require('../util/Logger');

var Connection = function (options) {
    if(options){
      this.name = options.name || null;
      this.host = options.host || null;
      this.port = options.port || null;  
    }
    
    // Initialize necessary properties from `EventEmitter` in this instance
    EventEmitter.call(this);

    this.connect = function () {
      Logger.info('Attempting to connect to '+this.name+' at '+this.host+':'+this.port);
      this.socket.connect(this.port, this.host);
    };

    this.disconnect=function(){
      Logger.info('Disconnecting from '+this.name+' at '+this.host+':'+this.port);
      this.socket.close();
    };

    this.reconnect=function(timeout,attempts){
      this.disconnect();      
      this.connect();
    };

    this.write=function(data){
      this.socket.write(data);
      this.emit('write',data);
      Logger.info("Network (dataRelay) Sent: " + data);
    };

    this.socket = new net.Socket();

    this.socket.on('connect',function(){
      this.emit('connect');
      Logger.info('Sucessfully connected to '+this.name+' with host '+this.host+' and port '+this.port);
    }.bind(this));

    this.socket.on('error',function(error){ 
      Logger.error('Problem with '+this.name+' connection (host: '+this.host+',port:'+this.port+')\n'
        +error.toString());
      this.emit('error', error); //NOTE: this will THROW an error if there is nothing listening to it!
    }.bind(this));

    this.socket.on('timeout',function(){
      this.emit('timeout');
      this.socket.setTimeout(5000);
      Logger.error('Timed out for 5s for '+this.name+' connection (host: '+this.host+',port:'+this.port+')');
    }.bind(this));

    this.socket.on('closed',function(had_error){
      this.emit('closed',had_error);
      if (had_error) {
          Logger.error('Connection to  '+this.name+'closed due to an error: Not reconnecting');
      } else {
          Logger.info('Connection to '+this.name+'closed: Not reconnecting');
      }
      //Data.headers = []; SHOULD we still do this? --serge
    }.bind(this));

    this.socket.on('data',function(data){
      this.emit('data',data);
    }.bind(this));
};

util.inherits(Connection,EventEmitter);

module.exports=Connection;