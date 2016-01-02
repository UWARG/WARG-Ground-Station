var fs=require('fs');
var _=require('underscore');

module.exports=function(template_name){
	return _.template(fs.readFileSync('./views/'+template_name+'.html','utf8'));
}