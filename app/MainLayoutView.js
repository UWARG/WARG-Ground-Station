
module.exports=function(Marionette,_){
	var template=require('./util/template');

	var MainLayoutView=Marionette.LayoutView.extend({
		template:template('testview'),
		initialize: function(){

		},
		serializeData: function(){
			return{
				hello:'wasup serge!'
			}
		}
	});

	return MainLayoutView;
}