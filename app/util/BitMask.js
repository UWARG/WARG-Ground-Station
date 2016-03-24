//Small utility library to manipulate bit masks
//Only works with integer, positive, inputs!
var Bitmask=function(decimal_value){
	if(isNaN(decimal_value) || decimal_value==null || Number(decimal_value)<0){
		throw Error('Error: Bitmask takes a positive number as a parameter');
	}
	this.decimal_value=parseInt(decimal_value);
    this.toBit=function(){
      return this.decimal_value.toString(2);
    }
    this.getBit=function(position){
    	return !!(this.decimal_value & (1<<position));
    }
    this.setBit=function(position, value){
    	if(this.getBit(position)){ //it's set
            if(!value){//clear
                this.value = (1 << position) ^ this.value;
            }// else it's already set!
        }else{ //not set
            if(value){
                this.value = (1 << position) | this.value;
            }// it's already not set!
        }
    }
};

module.exports=Bitmask;