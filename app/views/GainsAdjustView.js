var Template=require('../util/Template');
var TelemetryData=require('../models/TelemetryData');
var Commands=require('../models/Commands');

var GAINS={
  YAW: 0x00,
  PITCH: 0x01,
  ROLL: 0x02,
  HEADING: 0x03,
  ALTITUDE: 0x04,
  THROTTLE: 0x05,
  FLAP: 0x06
};

module.exports=function(Marionette){

  return Marionette.ItemView.extend({
    template:Template('GainsAdjustView'), 
    className:'gainsAdjustView', 

    ui:{
      yaw_kd:'#yaw-kd',
      yaw_ki:'#yaw-ki',
      yaw_kp:'#yaw-kp',
      pitch_kd:'#pitch-kd',
      pitch_ki:'#pitch-ki',
      pitch_kp:'#pitch-kp',
      roll_kd:'#roll-kd',
      roll_ki:'#roll-ki',
      roll_kp:'#roll-kp',
      heading_kd:'#heading-kd',
      heading_ki:'#heading-ki',
      heading_kp:'#heading-kp',
      altitude_kd:'#altitude-kd',
      altitude_ki:'#altitude-ki',
      altitude_kp:'#altitude-kp',
      throttle_kd:'#throttle-kd',
      throttle_ki:'#throttle-ki',
      throttle_kp:'#throttle-kp',
      flap_kd:'#flap-kd',
      flap_ki:'#flap-ki',
      flap_kp:'#flap-kp',
      orbit_kp:'#orbit-kp',
      path_kp:'#path-kp',

      send_all:'#send-all-gains-button',
      reset_all:'#reset-default-gains-button',
      yaw_send_button:'#send-yaw-gain-button',
      pitch_send_button:'#send-pitch-gain-button',
      roll_send_button:'#send-roll-gain-button',
      heading_send_button:'#send-heading-gain-button',
      altitude_send_button:'#send-altitude-gain-button',
      throttle_send_button:'#send-throttle-gain-button',
      flap_send_button:'#send-flap-gain-button',
      path_send_button:'#send-path-gain-button',
      orbit_send_button:'#send-path-gain-button'
    },

    events:{
      'click #send-yaw-gain-button':'sendYawGains',
      'click #send-pitch-gain-button':'sendPitchGains',
      'click #send-roll-gain-button':'sendRollGains',
      'click #send-heading-gain-button':'sendHeadingGains',
      'click #send-altitude-gain-button':'sendAltitudeGains',
      'click #send-throttle-gain-button':'sendThrottleGains',
      'click #send-flap-gain-button':'sendFlapGains',
      'click #send-orbit-gain-button':'sendOrbitGains',
      'click #send-path-gain-button':'sendPathGains'
    },

    initialize: function(){
      this.verification_quoue=[];//verifies that the gain value sent is the one thats being used
    },
    onRender:function(){
      TelemetryData.addListener('data_received',function(data){
        if(this.verification_quoue.length>0 && data.editing_gain===this.verification_quoue[0].type && data.kd_gain===this.verification_quoue[0].kd
            && data.kp_gain===this.verification_quoue[0].kp && data.ki_gain===this.verification_quoue[0].ki){
          this.verification_quoue[0].button.text('Send');
          this.verification_quoue.shift();
          Commands.showGain(this.verification_quoue[0].type);
        }
      });
    },
    onBeforeDestroy:function(){
      
    },

    addToVerificationQuoue: function(object){
      //get rid of any verification requests of the same type
      for(var i=0;i<this.verification_quoue.length;i++){
        if(this.verification_quoue[i].type===object.type){
          this.verification_quoue.splice(i,1);
          i--;
        }
      }
      this.verification_quoue.push(object);
      object.button.text('Verifiying..');
      Commands.showGain(this.verification_quoue[0].type);
    },

    sendYawGains: function(){
      var ki=this.ui.yaw_ki.val();
      var kd=this.ui.yaw_kd.val();
      var kp=this.ui.yaw_kp.val();
      Commands.sendKPGain('yaw',kp);
      Commands.sendKIGain('yaw',ki);
      Commands.sendKDGain('yaw',kd);
      this.addToVerificationQuoue({
        type: GAINS.YAW,
        ki: ki,
        kp: kp,
        kd: kd,
        button: this.ui.yaw_send_button
      });
    },
    sendPitchGains: function(){
      var ki=this.ui.pitch_ki.val();
      var kd=this.ui.pitch_kd.val();
      var kp=this.ui.pitch_kp.val();
      Commands.sendKPGain('pitch',kp);
      Commands.sendKIGain('pitch',ki);
      Commands.sendKDGain('pitch',kd);
      this.addToVerificationQuoue({
        type: GAINS.PITCH,
        ki: ki,
        kp: kp,
        kd: kd,
        button: this.ui.pitch_send_button
      });
    },
    sendRollGains: function(){
      var ki=this.ui.roll_ki.val();
      var kd=this.ui.roll_kd.val();
      var kp=this.ui.roll_kp.val();
      Commands.sendKPGain('roll',kp);
      Commands.sendKIGain('roll',ki);
      Commands.sendKDGain('roll',kd);
      this.addToVerificationQuoue({
        type: GAINS.ROLL,
        ki: ki,
        kp: kp,
        kd: kd,
        button: this.ui.roll_send_button
      });
    },
    sendHeadingGains: function(){
      var ki=this.ui.heading_ki.val();
      var kd=this.ui.heading_kd.val();
      var kp=this.ui.heading_kp.val();
      Commands.sendKPGain('heading',kp);
      Commands.sendKIGain('heading',ki);
      Commands.sendKDGain('heading',kd);
      this.addToVerificationQuoue({
        type: GAINS.HEADING,
        ki: ki,
        kp: kp,
        kd: kd,
        button: this.ui.heading_send_button
      });
    },
    sendAltitudeGains: function(){
      var ki=this.ui.altitude_ki.val();
      var kd=this.ui.altitude_kd.val();
      var kp=this.ui.altitude_kp.val();
      Commands.sendKPGain('altitude',kp);
      Commands.sendKIGain('altitude',ki);
      Commands.sendKDGain('altitude',kd);
      this.addToVerificationQuoue({
        type: GAINS.ALTITUDE,
        ki: ki,
        kp: kp,
        kd: kd,
        button: this.ui.altitude_send_button
      });
    },
    sendThrottleGains: function(){
      var ki=this.ui.throttle_ki.val();
      var kd=this.ui.throttle_kd.val();
      var kp=this.ui.throttle_kp.val();
      Commands.sendKPGain('throttle',kp);
      Commands.sendKIGain('throttle',ki);
      Commands.sendKDGain('throttle',kd);
      this.addToVerificationQuoue({
        type: GAINS.THROTTLE,
        ki: ki,
        kp: kp,
        kd: kd,
        button: this.ui.throttle_send_button
      });
    },
    sendFlapGains: function(){
      var ki=this.ui.flap_ki.val();
      var kd=this.ui.flap_kd.val();
      var kp=this.ui.flap_kp.val();
      Commands.sendKPGain('flap',kp);
      Commands.sendKIGain('flap',ki);
      Commands.sendKDGain('flap',kd);
      //support for flap gain verification is not implemented in the picpilot yet
      // this.addToVerificationQuoue({
      //   type: GAINS.FLAP,
      //   ki: ki,
      //   kp: kp,
      //   kd: kd,
      //   button: this.ui.flap_send_button
      // });
    },
    sendOrbitalGains: function(){
      var kp=this.ui.orbit_kp.val();
      Commands.sendOrbitGain(kp);
      //support for path and orbit gains verification is not implemented via the picpilot yet
    },
    sendPathGains: function(){
      var kp=this.ui.path_kp.val();
      Commands.sendPathGain(kp);
      //support for path and orbit gains verification is not implemented via the picpilot yet
    },
    sendAllGains: function(){
      this.sendYawGains();
      this.sendPitchGains();
      this.sendROllGains();
      this.sendHeadinGains();
      this.sendAltitudeGains();
      this.sendThrottleGains();
      this.sendFlapGains();
      this.sendOrbitalGains();
      this.sendPathGains();
    }
  });
};