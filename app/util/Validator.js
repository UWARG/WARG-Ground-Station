//Useful and commonly used validation functions used throughout the app
var Validator={
  isValidNumber:function(number){
    if(typeof number!=='undefined' && number!==null && !isNaN(number)){
      return true;
    }
  },
  isValidPitch: function(pitch){
    if(this.isValidNumber(pitch)){
      return true;
    }
    return false
  },
  isValidRoll: function(roll){
    if(this.isValidNumber(roll)){
      return true;
    }
    return false
  },
  isValidHeading: function(heading){
    if(this.isValidNumber(heading)){
      return true;
    }
    return false
  },
  isValidSpeed: function(speed){
    if(this.isValidNumber(speed) && Number(speed)>=0){
      return true;
    }
    return false;
  },
  isValidAltitude: function(altitude){
    if(this.isValidNumber(altitude) && Number(altitude)>=0){
      return true;
    }
    return false;
  }
};

module.exports=Validator;