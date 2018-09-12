/*
* 	<!-- Karten einbinden-->
*	erfolt in mehreren Schritten:
*	1. Variablem definieren für Link(Webadresse), Link(Kartendienst), Quellenangabe und für den Aufruf der Karte
*	2. Kartencontainer mit einem Kartendienst vorbelegen, Bbox definieren, Zoomlevel definieren
*	3. Baselayer eingeben
*/

//	1.) 
	var 
//OSM
			osmLink = '<a href = "http://openstreetmap.org">OpenStreetMap</a>',		//<!--Link FÜR Quellenangabe-->
			osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',			//<!--Kartenlink FÜR Kartendienst-->
			osmAttrib =  '&copy; ' + osmLink + ' Contributors',						//<!--Quellangabe-->
			osmMap = L.tileLayer(osmUrl, {attribution: osmAttrib, maxZoom: 20}),	//<!--Variable fasst obige Infos zusammen. (Kartenlinks + Prameter (Quellangabe, maxZoom...))-->
//Mapbox		
			mapboxLink = '<a href = "http://mapbox.com">Mapbox</a>',				
			mapboxUrl = 'https://a.tiles.mapbox.com/v3/rotkelch.ib6amnh3/{z}/{x}/{y}.png',
			mapboxAttrib = 'Map data &copy; <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
			mapboxMap = L.tileLayer(mapboxUrl, {attribution: mapboxAttrib});
//	2.)	<!-- Kartencontainer wird mit einer Karte belegt und Ausschnitt, Zoomlevel bestimmt-->
	var 	map = L.map('map', {	layers: [osmMap]	}).setView([48.13925, 11.56536], 16);
//	3.)	<!-- Hier werden LAyer definiert- die in der Layer übersicht erschienen ->
	var 	baseLayers = {
			"OSM Mapnik": osmMap,
			"Mapbox streets": mapboxMap
			};
//	<!-- Layerschaltflächen für Kartendienste -->
	L.control.layers(baseLayers).addTo(map); 

/*
* ##### POIs #####
* Daten über Overpass API abfragen und in GEOJSON Daten transformieren
*	4. Koordinaten werden abgegriffen für die Overpass API Abfrage
*	5. Abfrage in eine Variable schreiben
*	6. mit JQuery $ werden die Daten bezogen und mittels 'osm2geojson' umgewandelt, gestylt
*/

//	4.) Koordinaten werden abgegriffen für die Overpass API Abfrage
function getCoords(){
	var 	coords = map.getBounds();				//Koordinaten BBOX abgreifen
	var		lefttop = coords.getNorthWest();		//Koordinaten splitten linksoben
	var		rightbottom = coords.getSouthEast();	//Koordinaten splitten rechtsunten
	// Addiere Werte, damit nicht immer Daten nachgeladen werden bei Kartenverschieben --> vergrößerte BBOX
	 latLeftTopPlus = parseFloat(lefttop.lat) + 0.05;
	 lonLeftTopPlus = parseFloat(lefttop.lng) - 0.05;
	 latRightBtmPlus = parseFloat(rightbottom.lat) - 0.05;
	 lonRightBtmPlus = parseFloat(rightbottom.lng) + 0.05;
/*	console.log("lefttop.lat: " + lefttop.lat); 
	console.log("lefttop.lng:  " + lefttop.lng);  
	console.log("rightbottom.lat: " + rightbottom.lat);  
	console.log("rightbottom.lng: " + rightbottom.lng);
	console.log("latLeftTopPlus: " + latLeftTopPlus); 
	console.log("lonLeftTopPlus: " + lonLeftTopPlus);  
	console.log("latRightBtmPlus: " + latRightBtmPlus);  
	console.log("lonRightBtmPlus: " + lonRightBtmPlus);*/

	if (map.getZoom() <= 16) {						// Abfrage prüft ob rausgezoomt wurde, dann sollen POIs WIEDER angezeigt werden.
		//getGeojsonPoi(lefttop.lat,lefttop.lng,rightbottom.lat,rightbottom.lng);
		getGeojsonPoi(latLeftTopPlus,lonLeftTopPlus,latRightBtmPlus,lonRightBtmPlus);
	}
	};

//	5.)	<!-- Hier kommt die Abfrage für die Overpass-api in eine Variable--> // OFFEN: Anfrage verändern das Daten nicht bei jeder Bewegung abgefragt werden sondern für einen größeren Bereich!
function getGeojsonPoi(leftlat,leftlng,rightlat,rightlng){
    var 	query = '<query type="node"><has-kv k="railway" modv="" v="station"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><print/><union><query type="way"><has-kv k="railway" modv="" v="station"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="way-node"/></union><print/><union><query type="relation"><has-kv k="railway" modv="" v="station"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/>';
//	6.) Daten mit JQuery abgreifen und in geojson transformieren, stylen
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data) {
			var geoJson = osmtogeojson(data);
				stationPois = new L.geoJson(geoJson, {
				// Poppup mit Inhalt definieren 
					onEachFeature: function(feature, layer) {
						layer.on("mouseover", function (e) {		// Poppup wird geladen wenn Mouseover
							layer.bindPopup('<b>' + feature.properties.tags.name + '</b>').togglePopup();		// Poppup wird angezeigt sobald mouseover 
	          			});
					}
        		});	
			// Marker der Karte hinzufügen
            stationPois.addTo(map);
       		stationPois.on('click', onClick);
	});

	// Bei Klick zum POI zoomen und zentrieren, satioinPoi Daten löschen
	function onClick(selPoi){
		map.setView(selPoi.latlng, 18);
		getGeojsonData(leftlat,leftlng,rightlat,rightlng);
		map.removeLayer(stationPois);	//StationPOIs daten löschen
	}
};

function getGeojsonData(leftlat,leftlng,rightlat,rightlng){
//console.log(leftlat,leftlng,rightlat,rightlng);
    var 	query = '<query type="node"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><print/><union><query type="way"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="way-node"/></union><print/><union><query type="relation"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/>';
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data) {
			var geoJSON = osmtogeojson(data, {
				polygonFeatures: {
					"building": true,
					"railway": {
						"included_values": {
							"station": true,
							"turntable": true,
							"roundhouse": true,
							"platform": true
						}
					},
					"shop": true,
					"amenity": true,
					"amenity:fast_food": true,
					"area": true,
					"public_transport": true,
					"area:highway": true
				}
			});
	//console.log(geoJSON);
	indoorLayer = new L.Indoor(geoJSON, {
		getLevel: function(feature) { 
			if (feature.properties.tags.length === 0)
				return null;
				return feature.properties.tags.layer;
		},
		// Poppup mit Inhalt definieren --> Es muss noch eine FUnktion herum, die prüft ob Name, description vorhanden; Öffnungszeiten, Kosten...
		onEachFeature: function(feature, layer) {
			layer.bindPopup('<b>' + feature.properties.tags.name + '</b><br>' + '<br \/>' + feature.properties.tags.description + '<\/p>');
		},
		// Aussehen der GeoJson Daten definieren
        style: function(feature) {
        //Verkehr    
	        //PLattform
	        if (feature.properties.tags.public_transport === 'platform') {
	            return {fillColor: '#FBEF69', color: '#FFFFFF', weight: 2, fillOpacity: 0.5}    
	        }	//Schiene    
        	if (feature.properties.tags.railway === 'rail') {
        		return {color: '#FA6666', weight: 9}
        //Ausstattung	
			}	//Treppe
	        if (feature.properties.tags.highway === 'steps') {
	            return {dashArray: '5,5', color: '#99CC00', opacity: 1, weight: 2, zIndex: 1}
    		}	//Fußwege 
	        if (feature.properties.tags.highway === 'footway') {
	            return {color: '#99CC00', opacity: 0.4, weight: 8}
            }	//Aufzug
	        if (feature.properties.tags.highway === 'elevator') {
	            return {fillColor: '#98E466', color: '#FFFFFF', weight: 2, fillOpacity: 0.9}    
        	}	//Essen
			if (feature.properties.tags.shop === 'food') {
	            return {fillColor: '#FBDDFB', color: '#FFFFFF', weight: 2, fillOpacity: 0.9, zIndex: 5}
            }	//Bäckerei
        	if (feature.properties.tags.shop === 'bakery') {
	            return {fillColor: '#FBDDFB', color: '#FFFFFF', weight: 2, fillOpacity: 0.9}
	        }	//Geschäft
            if (feature.properties.tags.shop === 'yes') {
	           	return {fillColor: '#FFC1BE', color: '#FFFFFF', weight: 2, fillOpacity: 0.9} 
	        }	//Telefon
	        if (feature.properties.tags.shop === 'mobile_phone') {
	        	return {fillColor: '#FFC1BE', color: '#FFFFFF', weight: 2, fillOpacity: 0.9}
	        }	//SHOP
	        if (feature.properties.tags.shop) {
	        	return {fillColor: '#FFC1BE', color: '#FFFFFF', weight: 2, fillOpacity: 0.9}
			}	//FAst_Food
	        if (feature.properties.tags.amenity === 'fast_food') {
	        	return {fillColor: '#FBDDFB', color: '#FFFFFF', weight: 2, fillOpacity: 0.9}
	        }	//Einrichtung
	        if (feature.properties.tags.amenity) {
	        	return {fillColor: '#ffcc99', color: '#FFFFFF', weight: 2, fillOpacity: 0.9}
        	}	//Einrichtung
        	if (feature.properties.tags.amenity === 'yes') {
        		return {fillColor: '#FFF0FF', color: '#FFFFFF', weight: 2, fillOpacity: 0.9}
	        } 	//Tunnel
	        if (feature.properties.tags.tunnel === 'yes') {
	            return {fillColor: '#f0f8ff', color: '#FFFFFF', weight: 2, fillOpacity: 0.4, zIndex: 1}
	        }	//Sicherheitsdienst
			if (feature.properties.tags.description === 'security service') {
	            return {fillColor: '#f6f6f6', color: '#FFFFFF', weight: 2, fillOpacity: 0.9}
	        }	//Fläche Allgemein
	        if(feature.properties.tags.area === 'yes') {
	        	return {fillColor: '#CED7E0', color: '#FFFFFF', weight: 2, fillOpacity: 0.1, zIndex: 1}
	        }
		}
   });
// Indoor Layer auf null setzen und IndoorLayer zur Karte hinzufügen				
    indoorLayer.setLevel("0");
    indoorLayer.addTo(map);
//LevelControl anlegen und mit Level info aus IndoorLayer füllen
    levelControl = new L.Control.Level({
        level: "0",
        levels: indoorLayer.getLevels()
    });
// Level-Schaltflächen mit Indoor-Layer verknüpfen
    levelControl.addEventListener("levelchange", indoorLayer.setLevel, indoorLayer);
    levelControl.addTo(map);
	//console.log(map.hasLayer(indoorLayer));
//wird bei Zoomende aufgerufen, testet ob Maßstab zu klein, dann remove INDOOR
	map.on('zoomend', function(){	//Wenn Zoom < x dann schalte Indoor-Anzeige aus und aktiviere wieder POI-Anzeige
		if (map.getZoom() < 17 && map.hasLayer(indoorLayer)) {
			//console.log("!! map < 17 !!");
			map.removeLayer(indoorLayer);
			map.removeControl(levelControl);
		}
	});
});
};

//wird bei Kartenbewegung aufgerufen, Check ob außerhalb von BBOX, wenn ja dann neue Daten laden (getCoords)
map.on('moveend', function(){
/*	console.log("lefttop.lat: " + lefttop.lat); 
	console.log("lefttop.lng:  " + lefttop.lng);  
	console.log("rightbottom.lat: " + rightbottom.lat);  
	console.log("rightbottom.lng: " + rightbottom.lng);
	console.log("latLeftTopPlus: " + latLeftTopPlus); 
	console.log("lonLeftTopPlus: " + lonLeftTopPlus);  
	console.log("latRightBtmPlus: " + latRightBtmPlus);  
	console.log("lonRightBtmPlus: " + lonRightBtmPlus);*/
	var moveendCoords = map.getBounds();				//Koordinaten BBOX abgreifen
	var	newLefttop = moveendCoords.getNorthWest();		//Koordinaten splitten linksoben
	var	newRightbottom = moveendCoords.getSouthEast();	//Koordinaten splitten rechtsunten
	if (parseFloat(newLefttop.lat) >= parseFloat(latLeftTopPlus) || parseFloat(newLefttop.lng) <= parseFloat(lonLeftTopPlus) || parseFloat(newRightbottom.lat) <= parseFloat(latRightBtmPlus) || parseFloat(newRightbottom.lng) >= parseFloat(lonRightBtmPlus)){
		getCoords();}});

//	<!-- Geocoder Schaltfläche: Für Suchen-Funktion. Möglichkeit in Klammer: collapsed: false, position: 'bottomright',text: 'Find!', ->	
var osmGeocoder = new L.Control.OSMGeocoder(); map.addControl(osmGeocoder);
//wird bei Seitenaufruf aufgerufen
getCoords();