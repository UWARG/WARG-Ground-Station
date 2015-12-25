var Template=require('../util/Template');
var Logger=require('../util/Logger');
var Network=require('../Network');

module.exports=function(Marionette,_){

  return Marionette.ItemView.extend({
    template:Template('ConsoleView'),

    ui:{
      console:"#console",
      command_input:"#commands-input",
      info_toggle:"#console-info-toggle",
      debug_toggle:"#console-debug-toggle",
      error_toggle:"#console-error-toggle",
      warn_toggle:"#console-warn-toggle",
      data_toggle:"#console-data-toggle"
    },

    events:{
      'click #scroll-bottom-button':'enableScrollBottom',
      'click #send-command-button':'sendCommand',
      'submit #commands-input-form':'sendCommand',
      'keyup #commands-input':'cycleCommandHistory',
      'change #console-info-toggle':'toggleInfoMessages',
      'change #console-debug-toggle':'toggleDebugMessages',
      'change #console-error-toggle':'toggleErrorMessages',
      'change #console-warn-toggle':'toggleWarnMessages',
      'change #console-data-toggle':'toggleDataMessages',
    },

    className:'consoleView',

    initialize: function(){
      this.scroll_bottom=true;
      this.command_history=[];
      this.command_history_index=0;

      //whats kinds of messages we want displayed in the console
      this.infoMessages=!true;
      this.debugMessages=!true;
      this.errorMessages=!true;
      this.warnMessages=!true;
      this.dataMessages=!false;

      this.network_callbacks={}; //we need to keep a reference to these so that we can safely detach the network listener if we need to
    },

    onRender:function(){
      this.toggleInfoMessages();
      this.toggleDebugMessages();
      this.toggleErrorMessages();
      this.toggleWarnMessages();
      this.toggleDataMessages();

      this.detectScrollUp();
    },
    toggleInfoMessages:function(){
      if(this.infoMessages){
        if(this.network_callbacks['info']){
          Logger.removeListener('info',this.network_callbacks['info']);
        }
        this.infoMessages=false;
      }else{
        var callback=this.addInfoMessage.bind(this);
        this.network_callbacks['info']=callback;
        Logger.addListener('info',callback);
        this.infoMessages=true;
        this.scroll_bottom=true;
      }
      this.ui.info_toggle.prop('checked',this.infoMessages);
    },
    toggleDebugMessages:function(){
      if(this.debugMessages){
        if(this.network_callbacks['debug']){
          Logger.removeListener('debug',this.network_callbacks['debug']);
        }
        this.debugMessages=false;
      }else{
        var callback=this.addDebugMessage.bind(this);
        this.network_callbacks['debug']=callback;
        Logger.addListener('debug',callback);
        this.debugMessages=true;
        this.scroll_bottom=true;
      }
      this.ui.debug_toggle.prop('checked',this.debugMessages);
    },
    toggleErrorMessages:function(){
      if(this.errorMessages){
        if(this.network_callbacks['error-log']){
          Logger.removeListener('error-log',this.network_callbacks['error-log']);
        }
        this.errorMessages=false;
      }else{
        var callback=this.addErrorMessage.bind(this);
        this.network_callbacks['error-log']=callback;
        Logger.addListener('error-log',callback);
        this.errorMessages=true;
        this.scroll_bottom=true;
      }
      this.ui.error_toggle.prop('checked',this.errorMessages);
    },
    toggleWarnMessages:function(){
      if(this.warnMessages){
        if(this.network_callbacks['warn']){
          Logger.removeListener('warn',this.network_callbacks['warn']);
        }
        this.warnMessages=false;
      }else{
        var callback=this.addWarnMessage.bind(this);
        this.network_callbacks['warn']=callback;
        Logger.addListener('warn',callback);
        this.warnMessages=true;
        this.scroll_bottom=true;
      }
      this.ui.warn_toggle.prop('checked',this.warnMessages);
    },
    toggleDataMessages:function(){
      if(this.dataMessages){
        if(this.network_callbacks['data']){
          Logger.removeListener('data',this.network_callbacks['data']);
        }
        this.dataMessages=false;
      }else{
        var callback=this.addDataMessage.bind(this);
        this.network_callbacks['data']=callback;
        Logger.addListener('data',callback);
        this.dataMessages=true;
        this.scroll_bottom=true;
      }
      this.ui.data_toggle.prop('checked',this.dataMessages);
    },
    addInfoMessage:function(time,text){
      this.ui.console.append('<p class="message info-message"><time>'+time+'</time>'+text+'</p>');
      this.scrollToBottom();
    },
    addDebugMessage:function(time,text){
      this.ui.console.append('<p class="message debug-message"><time>'+time+'</time>'+text+'</p>');
      this.scrollToBottom();
    },
    addErrorMessage:function(time,text){
      this.ui.console.append('<p class="message error-message"><time>'+time+'</time>'+text+'</p>');
      this.scrollToBottom();
    },
    addWarnMessage:function(time,text){
      this.ui.console.append('<p class="message warn-message"><time>'+time+'</time>'+text+'</p>');
      this.scrollToBottom();
    },
    addDataMessage:function(time,text){
      this.ui.console.append('<p class="message data-message"><time>'+time+'</time>'+text+'</p>');
      this.scrollToBottom();
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
    detectScrollUp:function(){ //disables scrollToBottom if it detects an upward scroll
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