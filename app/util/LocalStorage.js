var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('../../local_storage'); //location of the local storage file

module.exports=localStorage;