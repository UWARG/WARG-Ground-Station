module.exports=function(Marionette,_){
	var Template=require('./util/Template');

	var MainLayoutView=Marionette.LayoutView.extend({
		template:Template('MainLayoutView'),
		initialize: function(){
			var Backbone=require('backbone');

		},
		serializeData: function(){
			return{
				hello:'wasup serge!'
			}
		}
	});

	return MainLayoutView;
}