//created by Serj Babayan for the Waterloo Aerial Robotics Group on March 19, 2016
//This file contains the waypoint class used within the MapView

var waypointIcon = L.divIcon({className: 'waypointIcon',html:''});

L.waypoint= L.Marker.extend({
	initialize: function (latlngalt, options) { //latlngalt is an array of size 3 in this manner: [lat, lon, alt]
    if(L.Util.isArray(latlngalt)){
      if(latlngalt.length!==3){
        throw new Error('L.waypoint must be initialized with an array of 3 [lat, lon, alt] or an object');
      }
    }
    else{
      if(!(latlngalt && latlngalt.alt && latlngalt.lat && latlngalt.lng)){
        throw new Error('L.waypoint must be with an object that contains lat,lng, and alt properties');
      }
    }
    options=options || {};
    options.icon=waypointIcon; //give it the proper icon
    options.draggable=true;
    options.waypointCount= options.waypointCount || 0;
    this.waypointCount=options.waypointCount;
    L.Marker.prototype.initialize.call(this, latlngalt, options);
    this.updateIcon();
  },

  changeAltitude: function(new_alt){
    if(!isNaN(new_alt)){
      this._latlng.alt=new_alt;
      this.updateIcon();
    }
    else{
      console.error('L.waypoint.changeAltitude takes in a number parameter. Received: '+new_alt);
    }
  },

  changeWaypointCount: function(new_number){
    if(!isNaN(new_number)){
      this.waypointCount=new_number;
      this.updateIcon();
    }
    else{
      console.error('L.waypoint.changeWaypointCount takes in a number parameter. Received: '+new_number);
    }
  },

  setDeleted: function(status){
    if(status){
      this._icon.className+=' waypointIconRemove';
    }
    else{
      this.options.icon.options.className=this.options.icon.options.className.replace('waypointIconRemove','');
    }
  },

  setFlashing: function(status){
    if(status){
      this.flashing=false;
      this.flashingInterval=setInterval(function(){
        debugger
        if(this.flashing){
          this._icon.className=this._icon.className.replace(' waypointIconFlashing','');
          this.flashing=false;
        }
        else{
          this._icon.className+=' waypointIconFlashing';
          this.flashing=true;
        }
      }.bind(this),200);
    }
    else{
      clearInterval(this.flashingInterval);
    }
  },

  updateIcon: function(){
    this.options.icon.options.html='<div class="inner-circle"><p>#'+this.waypointCount+'</p><p>'+this._latlng.alt+'m</p></div>';
  }
});