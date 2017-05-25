//Window Sub Menu
var window_sub = new gui.Menu();

window_sub.append(new gui.MenuItem({
	label:"My New Window",
	type:"checkbox",
	click:function(){
		gui.Window.open('windows/new-window.html',{
				focus:true
		});
	},
	key: "k",
	modifiers:"ctrl-shift",
}));