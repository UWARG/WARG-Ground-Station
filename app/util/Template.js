/**
 * @author Serge Babayan
 * @module util/Template
 * @requires fs
 * @requires underscore
 * @copyright Waterloo Aerial Robotics Group 2016
 * @licence ISC
 * @description This module uses [underscore's](http://underscorejs.org/#template) template generation with an input from the html files
 * in the `project_root/views` directory. It outputs a templated file (stringified version of the html)
 * that you can use as a template to your views.
 */

var fs=require('fs');
var _=require('underscore');

/**
 * @function
 * @param template_name {string} The name of the html file you'd like to use as the template for your view.
 * If its in the root of the views folder, just put in the file name. If its under a directory,
 * include the directory name (eg. `"subdirectory/MyHTMLFILE.html"`)
 * @returns {Object} A stringified version of the html that the view can use
 * as its template.
 * @example
 * <caption>Usage of the Template class in a view</caption>
 * var Template=require('./util/Template');
 * return Template('my_html_file_name_in_views.html');
 * //Use the output from this ^^ as your views template.
 */
var Template=function(template_name){
  return _.template(fs.readFileSync('./views/'+template_name+'.html','utf8'));
};

module.exports=Template;