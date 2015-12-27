var Template=require('../util/Template');

module.exports=function(Marionette){
  var ConsoleView=require('./ConsoleView')(Marionette);

	return Marionette.LayoutView.extend({
		template:Template('MainLayoutView'),
    className:'mainLayoutView',

    regions:{
      console:"#console-region",
      status:"#console-region",
      map: "#right-region",
      telemetry:"#top-left-region"
    },

		initialize: function(){

		},
    onRender:function(){
      this.getRegion('console').show(new ConsoleView());
    },
		serializeData: function(){
			return{
				hello:'wasup serge!'
			}
		}
	});
}