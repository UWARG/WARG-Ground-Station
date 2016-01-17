//These are common window shortcuts useful for debugging. So far its just dev tools, but more could be added. 
//Requires Mousetrap.js

var WindowShortcuts=function(Mousetrap,gui){
  // shortcuts go here

  //opens up devtools for the specified window
  Mousetrap.bind('mod+shift+j', function(e) {
      gui.Window.get().showDevTools() 
  });

  //refreshes the window
  Mousetrap.bind('mod+shift+r', function(e) {
      gui.Window.get().reload(3); 
  });
};

module.exports=WindowShortcuts;