//Small utility library to manipulate bit masks
//Only works with integer, positive, inputs!
var Validator=require('./Validator');

var Bitmask=function(decimal_value){
	var integer=parseInt(decimal_value);
	if(!Validator.isInteger(decimal_value) || integer<0){
		throw Error('Error: Bitmask takes a positive number as a parameter');
	}
	
	this.decimal_value=integer;

    this.toBit=function(){
      return this.decimal_value.toString(2);
    }
    this.getBit=function(position){ //will return a true if the bit is a 1, and a false if its a 0
    	return !!(this.decimal_value & (1<<position));
    }
    this.setBit=function(position, value){
    	value=!!value;
    	if(this.getBit(position)){ //it's set
            if(!value){//clear
                this.decimal_value = (1 << position) ^ this.decimal_value;
            }// else it's already set!
        }else{ //not set
            if(value){
                this.decimal_value = (1 << position) | this.decimal_value;
            }// it's already not set!
        }
    }
};

module.exports=Bitmask;