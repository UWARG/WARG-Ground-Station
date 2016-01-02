var net = require('net');
var util=require('util');
var EventEmitter = require('events');
var Logger=require('../util/Logger');
var advanced_config=require('../../config/advanced-config');

var Connection = function (options) {
    if(options && options.name && options.host && options.port){
      this.name = options.name;
      this.host = options.host;
      this.port = options.port;  
    }
    else{
      throw new Error("Connection name,host, and port parameters are all required!")
    }
    
    // Initialize necessary properties from `EventEmitter` in this instance
    EventEmitter.call(this);
    this.setMaxListeners(advanced_config.connection_max_listeners);

    this.connect = function () {
      Logger.info('Attempting to connect to '+this.name+' at '+this.host+':'+this.port);
      this.socket.connect(this.port, this.host);
    };

    this.disconnect=function(){
      Logger.info('Disconnecting from '+this.name+' at '+this.host+':'+this.port);
      this.socket.destroy();
    };

    this.reconnect=function(){
      this.disconnect();      
      this.connect();
    };

    this.write=function(data){
      this.socket.write(data,'utf8',function(error){
        if(!error){
          this.emit('write',data);
          Logger.info("Network "+this.name+" Sent: " + data);
        }
      }.bind(this));
    };

    this.socket = new net.Socket();

    this.socket.on('connect',function(){
      this.emit('connect');
      Logger.info('Sucessfully connected to '+this.name+' with host '+this.host+' and port '+this.port);
    }.bind(this));

    this.socket.on('error',function(error){ 
      Logger.error('Problem with '+this.name+' connection (host: '+this.host+',port:'+this.port+')\n'
        +error.toString());
      this.emit('socket_error', error); //NOTE: named socket_error and not error so as to not throw an exception
    }.bind(this));

    this.socket.on('timeout',function(){
      this.emit('timeout');
      Logger.error('Timed out for 5s for '+this.name+' connection (host: '+this.host+',port:'+this.port+')');
    }.bind(this));

    this.socket.on('close',function(had_error){
      this.emit('close',had_error);
      if (had_error) {
          Logger.error('Connection to  '+this.name+' closed due to an error: Not reconnecting');
      } else {
          Logger.warn('Connection to '+this.name+' closed: Not reconnecting');
      }
    }.bind(this));

    this.socket.on('data',function(data){
      this.emit('data',data);
    }.bind(this));
};

util.inherits(Connection,EventEmitter);

module.exports=Connection;