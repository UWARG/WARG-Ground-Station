//These are common window shortcuts useful for debugging. So far its just dev tools, but more could be added. 
//Requires Mousetrap.js

var WindowShortcuts=function(Mousetrap,gui){
  // shortcuts go here
  Mousetrap.bind('mod+shift+j', function(e) {
      gui.Window.get().showDevTools() 
  });
};

module.exports=WindowShortcuts;