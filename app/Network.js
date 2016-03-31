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

    disconnectAll: function(){
        var connection=Object.keys(this.connections);
        for(var i=0;i<connection.length;i++){
            this.connections[connection[i]].disconnect();
        }
    }
};

module.exports=Network;