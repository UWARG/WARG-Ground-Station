var Template=require('../util/Template');
var Logger=require('../util/Logger');
var Network=require('../Network');

module.exports=function(Marionette,_){

  return Marionette.ItemView.extend({
    template:Template('ConsoleView'),

    ui:{
      console:"#console",
      command_input:"#commands-input"
    },

    events:{
      'click #scroll-bottom-button':'enableScrollBottom',
      'click #send-command-button':'sendCommand',
      'submit #commands-input-form':'sendCommand',
      'keyup #commands-input':'cycleCommandHistory'
    },

    className:'consoleView',

    initialize: function(){
      this.scroll_bottom=true;
      this.command_history=[];
      this.command_history_index=0;
    },

    onRender:function(){
      var that=this;
      Logger.on('debug',function(time,text){
        that.ui.console.append('<p class="message debug-message"><time>'+time+'</time>'+text+'</p>');
        that.scrollToBottom();
      });
      Logger.on('warn',function(time,text){
        that.ui.console.append('<p class="message warn-message"><time>'+time+'</time>'+text+'</p>');
        that.scrollToBottom();
      });
      Logger.on('info',function(time,text){
        that.ui.console.append('<p class="message info-message"><time>'+time+'</time>'+text+'</p>');
        that.scrollToBottom();
      });
      Logger.on('error-log',function(time,text){
        that.ui.console.append('<p class="message error-message"><time>'+time+'</time>'+text+'</p>');
        that.scrollToBottom();
      });
      Logger.on('data',function(time,text){
        that.ui.console.append('<p class="message data-message"><time>'+time+'</time>'+text+'</p>');
        that.scrollToBottom();
      });

      this.detectScrollUp();
    },
    cycleCommandHistory: function(e){
      if(e.keyCode===38){ //keyup
        this.ui.command_input.val(this.command_history[this.command_history.length-1-this.command_history_index]);
        this.command_history.length-1-this.command_history_index>0 ? this.command_history_index++:this.command_history_index;
      }
      else if (e.keyCode===40){ //keydown
        this.ui.command_input.val(this.command_history[this.command_history.length-1-this.command_history_index]);
        this.command_history_index>0 ? this.command_history_index--:this.command_history_index;
      }
    },
    sendCommand: function(e){
      if(e) e.preventDefault();
      var command=this.ui.command_input.val();
      if(command && command.trim()){
        Network.connections['data_relay'].write(command.trim());
        this.ui.command_input.val('');
        this.command_history.push(command.trim());
        this.command_history_index=0;
      }
    },
    detectScrollUp:function(){
      var lastScrollTop = 0;
      var that=this;
      this.ui.console.scroll(function(event){
         var scrolltop = event.target.scrollTop;
         if (scrolltop < lastScrollTop){
            // upscroll code
            that.scroll_bottom=false;
          }
         lastScrollTop = scrolltop;
      });
    },
    enableScrollBottom:function(e){
      e.preventDefault();
      this.scroll_bottom=true;
      this.scrollToBottom();
    },
    scrollToBottom: function(){
      if(this.scroll_bottom){
        this.ui.console[0].scrollTop=this.ui.console[0].scrollHeight;
      }
    }
  });
}