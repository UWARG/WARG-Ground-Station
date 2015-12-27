//This is an example Marionette view
//NOTE: you should not require jquery in your views, as you should only reference the elements inside the view which you can do with the ui property of the view
var Template=require('../util/Template');
/*
call your other dependencies here (for example if you need to listen to network events, call this)
var Network=require('../Netowrk'); 
then use the Network object inside your view
*/

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('exampleView'), //name of the file in the views folder at the project root

    initialize: function(){
      //called when the view is first initialized (ie new ExampleView())
    },
    onRender:function(){
      //called right after a render is called on the view (view.render())
    },
    onBeforeDestroy:function(){
      //called just before destroy is called on the view
    },
    onDestroy:function(){
      //called right after a destroy is called on the view
    }
  });
};