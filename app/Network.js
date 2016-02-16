var Connection=require('./models/Connection');
var Logger=require('./util/Logger');

var Network={
    connections:{},

    addConnection:function(name,host,port){
        var new_connection=new Connection({
            name: name,
            host: host,
            port: port
        });
        this.connections[name]=new_connection;
        new_connection.connect();
        return new_connection;
    },

    //reconnects all of the connections in the network
    reconnectAll: function(){
      for(var connection in this.connections){
        if(this.connections.hasOwnProperty(connection)){
          this.connections[connection].reconnect();
        }
      }
    }
};

module.exports=Network;