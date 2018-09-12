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
			mapboxMap = L.tileLayer(mapboxUrl, {attribution: mapboxAttrib, maxZoom:20});
//	2.)	<!-- Kartencontainer wird mit einer Karte belegt und Ausschnitt, Zoomlevel bestimmt-->
	var 	map = L.map('map', {	layers: [mapboxMap]	}).setView([48.13925, 11.56536], 16);
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
var indoorLayer;
//	4.) Koordinaten werden abgegriffen für die Overpass API Abfrage
function getCoords(){
	var 	coords = map.getBounds();				//Koordinaten BBOX abgreifen
	var		lefttop = coords.getNorthWest();		//Koordinaten splitten linksoben
	var		rightbottom = coords.getSouthEast();	//Koordinaten splitten rechtsunten

	latLeftTop = lefttop.lat;
	lonLeftTop = lefttop.lng;
	latRightBtm = rightbottom.lat;
	lonRightBtm = rightbottom.lng;
	// Addiere/Subtrahiere Werte, damit nicht immer Daten  für GeoJSONPoi nachgeladen werden bei Kartenverschieben --> vergrößerte BBOX
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

	//if (map.getZoom() <= 16) {	// Abfrage prüft ob rausgezoomt wurde, dann sollen POIs WIEDER angezeigt werden.
		//console.log("getZoom() <= 16")
		//getGeojsonPoi(lefttop.lat,lefttop.lng,rightbottom.lat,rightbottom.lng);
		getGeojsonPoi(latLeftTopPlus,lonLeftTopPlus,latRightBtmPlus,lonRightBtmPlus);
	//}
	getGeojsonLine(latLeftTopPlus,lonLeftTopPlus,latRightBtmPlus,lonRightBtmPlus);
}
/*map.on('moveend', function(){
	var moveendCoords = map.getBounds();				//Koordinaten BBOX abgreifen
	var	newLefttop = moveendCoords.getNorthWest();		//Koordinaten splitten linksoben
	var	newRightbottom = moveendCoords.getSouthEast();
	if ((parseFloat(newLefttop.lat) >= parseFloat(latLeftTopPlus) || parseFloat(newLefttop.lng) <= parseFloat(lonLeftTopPlus) || parseFloat(newRightbottom.lat) <= parseFloat(latRightBtmPlus) || parseFloat(newRightbottom.lng) >= parseFloat(lonRightBtmPlus)) && map.getZoom() > 14){
		console.log("hello")
		getGeojsonLine();
	}
});*/
//Schienen
function getGeojsonLine(leftlat,leftlng,rightlat,rightlng){
	console.log("U-Bahn-Linien ABFRAGE")
    var 	query = '<union><query type="way"><has-kv k="railway" modv="" v="subway"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/><union><query type="relation"><has-kv k="ref" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="up"/></union><print/>';
//	6.) Daten mit JQuery abgreifen und in geojson transformieren, stylen
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data){
		var geoJson = osmtogeojson(data);
			transportLines = new L.geoJson(geoJson, {
				pointToLayer: function (feature, latlng){
					return L.circleMarker(latlng, {radius: 3, fillColor: "#ffffff", color: "#000", weight: 0.1, opacity: 1, fillOpacity: 0.8}); // siehe Funktion selectIcon
		        },
			// Poppup mit Inhalt definieren
				onEachFeature: function(feature, layer){
					layer.on("mouseover", function (e){		// Poppup wird geladen wenn Mouseover
						layer.bindPopup('<b>' + feature.properties.tags.name + '</b>');		// Poppup wird angezeigt sobald mouseover
          			});
				},
				style: function(feature){
		        //U-Bahn-Linien
		        // Hier muss eine Funktion hin die alle vorkommenden Namen aufgreift und Farben zuweist, damit diese Darstellung Überall klappt
			    name = feature.properties.tags.name;
			    	// typeof greift Fehler auf: TypeError
			        if (typeof feature.properties.relations[0] != "undefined"){
			        	console.log(feature.properties.relations[0].reltags.ref);
			        }
			        if (name.match('1')){
			        	//console.log(name);
			            return {color: '#228A00', weight: 4, opacity: 0.5};
			        }if (name.match('2')){
			            return {color: '#8A0037', weight: 4, opacity: 0.5};
			        }if (name.match('3')){
			            return {color: '#FF9500', weight: 4, opacity: 0.5};
			        }if (name.match('4')){
			            return {color: '#00D6A0', weight: 4, opacity: 0.5};
			        }if (name.match('5')){
			            return {color: '#996300', weight: 4, opacity: 0.5};
			        }if (name.match('6')){
			            return {color: '#008CFF', weight: 4, opacity: 0.5};
			        }if (name.match('7')){
			            return {color: '#49CAFC', weight: 4, opacity: 0.5};
			        }if (name.match('8')){
			            return {color: '#0044FF', weight: 4, opacity: 0.5};
			        }if (name.match('9')){
			            return {color: '#FF9729', weight: 4, opacity: 0.5};
			        }if (name.match('10')){
			            return {color: '#18a100', weight: 4, opacity: 0.5};
			        }if (name.match('11')){
			            return {color: '#FFB669', weight: 4, opacity: 0.5};
			        }if (name.match('12')){
			            return {color: '#7FFF69', weight: 4, opacity: 0.5};
			        }if (name.match('13')){
			            return {color: '#8C8C8C', weight: 4, opacity: 0.5};
			        }if (name.match('14')){ //wo
			            return {color: '#57CF42', weight: 4, opacity: 0.5};
			        }if (name.match('15')){
			            return {color: '#459636', weight: 4, opacity: 0.5};
			        }if (name.match('16')){
			            return {color: '#54EBD9', weight: 4, opacity: 0.5};
			        }if (name.match('17')){ //wo
			            return {color: '#18a100', weight: 4, opacity: 0.5};
			        }if (name.match('18')){ //wo
			            return {color: '#18a100', weight: 4, opacity: 0.5};
			        }if (name.match('19')){
			            return {color: '#C4C4C4', weight: 4, opacity: 0.5};
			        }if (name.match('20')){ //wo
			            return {color: '#7FFF69', weight: 4, opacity: 0.5};
			        }if (name.match('21')){
			            return {color: '#FFE32E', weight: 4, opacity: 0.5};
			        }if (name.match('70')){ //Ab hier Düsseldorf
			            return {color: '#FF0004', weight: 4, opacity: 0.5};
			        }if (name.match('71')){
			            return {color: '#ABABAB', weight: 4, opacity: 0.5};
			        }if (name.match('72')){
			            return {color: '#ABABAB', weight: 4, opacity: 0.5};
			        }if (name.match('73')){
			            return {color: '#ABABAB', weight: 4, opacity: 0.5};
			        }if (name.match('74')){
			            return {color: '#2734C4', weight: 4, opacity: 0.5};
			        }if (name.match('75')){
			            return {color: '#2734C4', weight: 4, opacity: 0.5};
			        }if (name.match('76')){
			            return {color: '#2734C4', weight: 4, opacity: 0.5};
			        }if (name.match('77')){
			            return {color: '#2734C4', weight: 4, opacity: 0.5};
			        }if (name.match('78')){
			            return {color: '#2734C4', weight: 4, opacity: 0.5};
			        }if (name.match('79')){
			            return {color: '#2734C4', weight: 4, opacity: 0.5};
		            }if (name.match('80')){
		            	return {color: '#ABABAB', weight: 4, opacity: 0.5};
		            }else{ // nicht anzeigen
		            	return {color:'none'};
		            }
				}
    		});
		// Marker der Karte hinzufügen
        transportLines.addTo(map);
	});
}

//	5.)	<!-- Hier kommt die Abfrage für die Overpass-api in eine Variable--> // OFFEN: Anfrage verändern das Daten nicht bei jeder Bewegung abgefragt werden sondern für einen größeren Bereich!
function getGeojsonPoi(leftlat,leftlng,rightlat,rightlng){
    var 	query = '<query type="node"><has-kv k="railway" modv="" v="station"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><print/><union><query type="way"><has-kv k="railway" modv="" v="station"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="way-node"/></union><print/><union><query type="relation"><has-kv k="railway" modv="" v="station"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/>';
//	6.) Daten mit JQuery abgreifen und in geojson transformieren, stylen
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data){
			var geoJson = osmtogeojson(data);
				stationPois = new L.geoJson(geoJson, {
					pointToLayer: function (feature, latlng){
						return selectIcon(feature, latlng); // siehe Funktion selectIcon
			        },
				// Poppup mit Inhalt definieren
					onEachFeature: function(feature, layer){
						layer.on("mouseover", function (e){		// Poppup wird geladen wenn Mouseover
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
		getGeojsonData(latLeftTop, lonLeftTop, latRightBtm, lonRightBtm);
		map.removeLayer(stationPois);	//StationPOIs daten löschen
		stationPois.clearLayers();
	}
}

// Funktion selectIcon ducht das Passende Icon raus
function selectIcon(feat, lalo){
	//return L.marker(latlng, {icon: metroIcon});
	if (feat.properties.tags.railway === 'station'){
    	return L.marker(lalo, {icon: metroIcon})
	}else if (feat.properties.tags.railway === 'subway_entrance'){
		return L.marker(lalo, {icon: metroIcon})
	}if (feat.properties.tags.amenity === 'fast_food'){
		return L.marker(lalo, {icon: fast_food})
	}else if (feat.properties.tags.amenity === 'pharmacy'){
    	return L.marker(lalo, {icon: pharmacy})
    }if(feat.properties.tags.railway === 'subway_entrance'){
    	return L.marker(lalo, {icon: entrance})
    }else{
    // Wenn kein ICON vorhanden mache ein CIRCLEICON siehe geoJsonMarkerOptions
    	return L.circleMarker(lalo, geojsonMarkerOptions)
    }
};

//Styling der Punkte
var geojsonMarkerOptions = {
		radius: 3,
	    fillColor: "#ffffff",
	    color: "#000",
	    weight: 0.1,
	    opacity: 1,
	    fillOpacity: 0.8
};

/*
* ##### DATA #####
* Daten über Overpass API abfragen und in GEOJSON Daten transformieren
*/
function getGeojsonData(leftlat,leftlng,rightlat,rightlng){
//console.log(leftlat,leftlng,rightlat,rightlng);
    var 	query = '<query type="node"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><print/><union><query type="way"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="way-node"/></union><print/><union><query type="relation"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/>';
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data){
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
		},	//PointtoLayer macht das keine dominanten Marker für Punktobjekte ausgegeben werden!
		pointToLayer: function (feature, latlng){
            //return L.circleMarker(latlng, geojsonMarkerOptions);
            return selectIcon(feature, latlng);
        },
// Poppup mit Inhalt definieren
		onEachFeature: function(feature, layer){
		//Hier wird der Poppup-Inhalt definiert
		//console.log(feature.properties.tags.name);
			if (feature.properties.tags.name){
				//var popupContent = '<b>' + feature.properties.tags.name + '</b><br>' + '<br \/>' + feature.properties.tags.description + '<\/p>';
				var name = feature.properties.tags.name;
				var description = feature.properties.tags.description;
				var opening = feature.properties.tags.opening_hours;
				var phone = feature.properties.tags.phone;
				var website = feature.properties.tags.website;
				//var header = '';
				//var contactInfo = '';
				//var street = feature.properties.tags.streetHolder;
				//var houseNr = feature.properties.tags.addr;
				//var streetHolder = "addr:street";
				//var houseNrHolder = "addr:housenumber";

				// Test: Wenn Daten vorhanden dann zu Popup hinzufügen!
				//Name + description
				var popupContent = '<caption><h3>' + name + '</h3></caption>';

				if (description){
					description = '<td colspan="2">' + description + '</td>';
					popupContent += description;
				}
/*				if (street && houseNr) {
					street = '<br \/>' + "<tr><td>Open:\t  </td><td>"+  street + ' ' + houseNr +  '</td></tr></b>';
					adressInfo += street;
				};*/
				if (opening){
					opening =  '<tr><td><i>Open: &nbsp;</i></td><td>' + opening + '</td></tr>';
					popupContent += opening;
				}
				if (phone){
					phone = phone;
					popupContent += '<tr><td><i>Call: &nbsp;</i></td><td>' + phone + '</td></tr>';
				}
				if (website){
					website = website.link(String(website));
					popupContent += '<tr><td><i>Visit: &nbsp;</i></td><td>' + website + '</td></tr>';
				};
				//Adress
/*				var adressInfo = adressInfo;
				popupContent += adressInfo; */

				//Contact Info
				popupContent =  '<table>' + popupContent + '</table>';
				layer.bindPopup(popupContent);
/*				console.log("header: " + header);
				console.log("contactInfo: " + contactInfo);
				console.log("popupContent: " + popupContent);
				console.log("description: " + description);
				console.log("opening: " + opening);
				console.log("phone: " + phone);
				console.log("website: " + website);*/
			} else if (feature.properties.tags.description){	//Falls 'description-Tag' vorhanden
				layer.bindPopup(feature.properties.tags.description);
			}
		},
// Aussehen der GeoJson Daten definieren
        style: function(feature){
        //Verkehr
	        //PLattform
	        if (feature.properties.tags.public_transport === 'platform'){
	            return {fillColor: '#FBEF69', color: '#333333', weight: 1, fillOpacity: 0.9};
	        }	//Schiene
        	if (feature.properties.tags.railway === 'rail'){
        		return {color: '#FA6666', weight: 9};
        	}	//Schiene, --> wird in Funktion geoJsonLine behanfdelt..
/*        	if (feature.properties.tags.railway === 'subway') {
        		return {color: '#FA6666', weight: 9};
        	}	//Schiene*/
        	if (feature.properties.tags.railway === 'proposed'){
        		return {color: '#FA6666', weight: 9};
        //Ausstattung
			}	//Treppe
	        if (feature.properties.tags.highway === 'steps'){
	            return {dashArray: '5,5', color: '#99CC00', opacity: 1, weight: 2, zIndex: 1};
    		}	//Fußwege
	        if (feature.properties.tags.highway === 'footway'){
	            return {color: '#99CC00', opacity: 1, weight: 1};
            }	//Aufzug
	        if (feature.properties.tags.highway === 'elevator'){
	            return {fillColor: '#98E466', color: '#FFFFFF', weight: 2, fillOpacity: 0.9};
        	}	//Essen
			if (feature.properties.tags.shop === 'food'){
	            return {fillColor: '#FBDDFB', color: '#FFFFFF', weight: 1, fillOpacity: 0.9};
            }	//Bäckerei
        	if (feature.properties.tags.shop === 'bakery'){
	            return {fillColor: '#FBDDFB', color: '#FFFFFF', weight: 1, fillOpacity: 0.9};
	        }	//Geschäft
            if (feature.properties.tags.shop === 'yes'){
	           	return {fillColor: '#FFC1BE', color: '#FFFFFF', weight: 1, fillOpacity: 0.9};
	        }	//Telefon
	        if (feature.properties.tags.shop === 'mobile_phone'){
	        	return {fillColor: '#FFC1BE', color: '#FFFFFF', weight: 1, fillOpacity: 0.9};
	        }	//SHOP
	        if (feature.properties.tags.shop){
	        	return {fillColor: '#FFC1BE', color: '#FFFFFF', weight: 1, fillOpacity: 0.9};
			}	//FAst_Food
	        if (feature.properties.tags.amenity === 'fast_food'){
	        	return {fillColor: '#FBDDFB', color: '#FFFFFF', weight: 1, fillOpacity: 0.9};
	        }	//Einrichtung
	        if (feature.properties.tags.amenity){
	        	return {fillColor: '#ffcc99', color: '#FFFFFF', weight: 1, fillOpacity: 0.9};
        	}	//Einrichtung
        	if (feature.properties.tags.amenity === 'yes'){
        		return {fillColor: '#FFF0FF', color: '#FFFFFF', weight: 1, fillOpacity: 0.9};
	        } 	//Tunnel
	        if (feature.properties.tags.tunnel === 'yes'){
	            return {fillColor: '#f0f8ff', color: '#FFFFFF', weight: 2, fillOpacity: 0.4};
	        }	//Sicherheitsdienst
			if (feature.properties.tags.description === 'security service') {
	            return {fillColor: '#f6f6f6', color: '#FFFFFF', weight: 1, fillOpacity: 0.9};
	        }	//Fläche allgemein
	        if(feature.properties.tags.area === 'yes'){
	        	return {fillColor: '#CED7E0', color: '#FFFFFF', weight: 2, fillOpacity: 0.5};
	        }	//ohne Tags
	        else{
	        	return {fillColor: false, color: '#FFFFFF', weight: 1, fillOpacity: 0};
	        }
		}
   });

	map.removeLayer(stationPois);
	stationPois.clearLayers();
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

	});
}

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
	// Wenn außerhalb des Koordinatenbereiches und Zoom > 14 dann getCoords
	if ((parseFloat(newLefttop.lat) >= parseFloat(latLeftTopPlus) || parseFloat(newLefttop.lng) <= parseFloat(lonLeftTopPlus) || parseFloat(newRightbottom.lat) <= parseFloat(latRightBtmPlus) || parseFloat(newRightbottom.lng) >= parseFloat(lonRightBtmPlus)) && map.getZoom() > 14){
		map.removeLayer(stationPois);
		stationPois.clearLayers();
		getCoords();
		//console.log("mooveEND -> getCoords");
	// Wenn Zoom <= 14 und stationpois vorhanden dann lösche stationpois
	}
	/*if (map.getZoom() <= 14 && map.hasLayer(stationPois)){
		map.removeLayer(stationPois);
		stationPois.clearLayers();
		console.log("1. Zoom() <=14 && map.hasLayer(stationPois) -> removeLayer");
	}*/
});
//wird bei Zoomende aufgerufen, testet ob Maßstab zu klein, dann remove INDOOR
map.on('zoomend', function(){	//Wenn Zoom < x dann schalte Indoor-Anzeige aus und aktiviere wieder POI-Anzeige
	if (map.getZoom() <= 14 && map.hasLayer(stationPois)){
		map.removeLayer(stationPois);
		stationPois.clearLayers();
	}	// Wenn Zoom > 14 und noch keine stationpois vorhanden, führe getCoords aus
	if (map.getZoom() > 14 && (map.hasLayer(stationPois) == false) && (map.hasLayer(indoorLayer) === false)){
		map.removeLayer(stationPois);
		stationPois.clearLayers();
		getCoords();
		console.log("Zoom > 14 -> getCoords");
		//console.log(stationPois);
	}if (map.getZoom() < 17 && map.hasLayer(indoorLayer)){
		console.log("Zoom() < 17 ");
		map.removeLayer(indoorLayer);
		map.removeControl(levelControl);
		map.removeLayer(stationPois);
		stationPois.clearLayers();
		getCoords();
	}if (map.hasLayer(indoorLayer)){
		map.removeLayer(stationPois);
		stationPois.clearLayers();
	}
});

//ICONs
var metroIcon = L.MakiMarkers.icon({
    icon: "rail-metro",
    color: "#005EBB",
    size: "l"
});

var fast_food = L.MakiMarkers.icon({
    icon: "fast-food",
    color: "#660000",
    size: "s"
});

var pharmacy = L.MakiMarkers.icon({
    icon: "pharmacy",
    color: "#660000",
    size: "s"
});

var entrance = L.MakiMarkers.icon({
    icon: "entrance",
    color: "#FFFF00",
    size: "s"
});

//	<!-- Geocoder Schaltfläche: Für Suchen-Funktion. Möglichkeit in Klammer: collapsed: false, position: 'bottomright',text: 'Find!', ->
var osmGeocoder = new L.Control.OSMGeocoder(); map.addControl(osmGeocoder);
//wird bei Seitenaufruf aufgerufen
getCoords();