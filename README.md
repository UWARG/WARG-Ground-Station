#WARG Ground Station V2
#####The ground station that displays received from the [data-relay-station](https://github.com/UWARG/data-relay-station)

Setup instructions:  
1. Clone the repo  
2. Download [Node.js](https://nodejs.org/en/) for your OS  
3. Download and install git lfs (Git Large File Storage) [here](https://git-lfs.github.com/) otherwise you won't be able to download the images  
4. Run `npm install` to install the app dependencies (including NW.js)  
5. Run `npm start` to start the app  

You can also start the app by running `nw` at the project root if you have NW.js globally installed by running `npm install -g nw`

Note: This application is boring unless you have the data relay station running.

Uses the following:  
-[jQuery](http://jquery.com/download)  
-[NW.js](http://nwjs.io)  
-[Leaflet](http://leafletjs.com)  
-[GMapCatcher](https://code.google.com/p/gmapcatcher/downloads/list)  

Map tiles are in OSM format. They can be downloaded and exported using GMapCatcher. Leaflet is the maps library used to display the tiles.

#License
[ISC](https://raw.githubusercontent.com/UWARG/WARG-Ground-Station-V2/FolderOrganization/LICENSE)
