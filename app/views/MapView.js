var Template=require('../util/Template');
var Map=require('../Map');

module.exports=function(Marionette,L){

  return Marionette.ItemView.extend({
    template:Template('MapView'),
    className:'mapView', 

    ui:{
      map:'#leaflet-map'
    },

    initialize: function(){
      this.map=new Map(L);

    },
    onRender:function(){
      this.ui.map.ready(function(){
       this.map.createMap('leaflet-map');
      }.bind(this));
    },
    onBeforeDestroy:function(){
      
    }
  });
};