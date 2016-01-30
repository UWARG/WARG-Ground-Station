var LocalStorage = require('node-localstorage').LocalStorage;
var path=require('path');

localStorage = new LocalStorage(path.join(__dirname,'../../local_storage')); //location of the local storage file

module.exports=localStorage;