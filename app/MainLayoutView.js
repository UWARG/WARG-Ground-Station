var Template=require('./util/Template');

module.exports=function(Marionette,_){
  var ConsoleView=require('./views/ConsoleView')(Marionette,_);

	return Marionette.LayoutView.extend({
		template:Template('MainLayoutView'),
    className:'mainLayoutView',

    regions:{
      console_region:"#bottom-left-region",
      map_region: "#right-region",
      dialog_region:"#top-left-region"
    },

		initialize: function(){

		},
    onRender:function(){
      this.getRegion('console_region').show(new ConsoleView());
    },
		serializeData: function(){
			return{
				hello:'wasup serge!'
			}
		}
	});
}