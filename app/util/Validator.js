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
    if(this.isValidNumber(pitch)){
      return true;
    }
    return false
  },
  isValidHeading: function(heading){
    if(this.isValidNumber(pitch)){
      return true;
    }
    return false
  }
};