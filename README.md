The ground station that displays received from the [data-relay-station](https://github.com/UWARG/data-relay-station)

Setup instructions:  
1. Clone the repo  
2. Download [Node.js](https://nodejs.org/en/) for your OS
3. Run `npm install` to install the app dependencies (including NW.js) 
4. Run `npm start` to start the app

Note: This application is boring unless you have the data relay station running.

Uses the following:  
-[jQuery](http://jquery.com/download)  
-[NW.js](http://nwjs.io)  
-[Leaflet](http://leafletjs.com)  
-[GMapCatcher](https://code.google.com/p/gmapcatcher/downloads/list)  

Map tiles are in OSM format. They can be downloaded and exported using GMapCatcher. Leaflet is the maps library used to display the tiles.