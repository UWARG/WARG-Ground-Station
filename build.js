var NwBuilder = require('nw-builder');
var projectConfig=require('./package.json');

var nw = new NwBuilder({
    files: ['./**','!./build/**/**','!./logs/**/**','!./node_modules/nw/**/**','!./node_modules/nw-builder/**/**'], 
    platforms: ['linux64', 'osx64',  'win64'],
    version: '0.12.3',
    buildDir:"./build",
    cacheDir:"./build/cache"
});

//Log stuff you want
nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
   console.log('================== Finished Building WARG GroundStation v'+projectConfig.version+' ==================');
}).catch(function (error) {
    console.error(error);
});