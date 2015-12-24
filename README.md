The ground station that displays received from the [data-relay-station](https://github.com/UWARG/data-relay-station)

#Installation 
1. Clone the repo  
2. Download [Node.js](https://nodejs.org/en/) for your OS
3. Run `npm install` to install the app dependencies (including NW.js) 
4. Run `npm start` to start the app

#Building
You have the option of building a self-contained cross-platform executable of the groundstation if you so wish. To do this, simply run `npm install` to install all of the app's dependencies, then run `npm run build`. This will use nw-builder to build the executable of the app and save it in the build directory.

Note: This application is boring unless you have the data relay station running.

Uses the following:  
-[jQuery](http://jquery.com/download)  
-[NW.js](http://nwjs.io)  
-[Leaflet](http://leafletjs.com)  
-[GMapCatcher](https://code.google.com/p/gmapcatcher/downloads/list)  

Map tiles are in OSM format. They can be downloaded and exported using GMapCatcher. Leaflet is the maps library used to display the tiles.