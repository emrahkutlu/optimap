/*  ### Layout Funktionen ###  */
$(document).on("click", ".feature-name", function(e) {
  sidebarClick(parseInt($(this).attr('id')));
});

$("#info-btn").click(function() {
  $("#aboutModal").modal("show");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  return false;
});

/* Verkehrsnetze */
$("#ubahn-btn").click(function() {
	//Automatische Umschaltung : 'toggle'
  $("#ubahn-btn").button('toggle')
  //$("#tram-btn").button('toggle')
  //("#bus-btn").button('reset');
  	if (typeof subwayLines != 'undefined'){
  		jsonLayers.addLayer(subwayLines)
  	}else {
		getGeoJsonSubway(latLeftTopPlusR,lonLeftTopPlusR,latRightBtmPlusR,lonRightBtmPlusR)
	};
  	if (typeof sRailLines != 'undefined'){
  		jsonLayers.removeLayer(sRailLines)
	};
	if (typeof tramLines != 'undefined'){
		jsonLayers.removeLayer(tramLines)
	};
  //map.removeLayer(busLines);
  return false;
});
$("#sbahn-btn").click(function() {
  $("#sbahn-btn").button('toggle')
  //$("#tram-btn").button('toggle')
  //("#bus-btn").button('reset');
  	if (typeof sRailLines != 'undefined'){
  		jsonLayers.addLayer(sRailLines)
  	}else {
  		getGeoJsonSRail(latLeftTopPlusR,lonLeftTopPlusR,latRightBtmPlusR,lonRightBtmPlusR);
  	};
  	if (typeof subwayLines != 'undefined'){
  		jsonLayers.removeLayer(subwayLines)
  	};
  	if (typeof tramLines != 'undefined'){
  		jsonLayers.removeLayer(tramLines)
  	};
  //map.removeLayer(busLines);
  return false;
});
$("#tram-btn").click(function() {
  $("#tram-btn").button('toggle')
  //$("#ubahn-btn").button('toggle')
  //("#bus-btn").button('reset');
	if (typeof tramLines != 'undefined'){
		jsonLayers.addLayer(tramLines)
	} else{
		getGeoJsonTram(latLeftTopPlusR,lonLeftTopPlusR,latRightBtmPlusR,lonRightBtmPlusR)
	};
	if (typeof subwayLines != 'undefined'){
  		jsonLayers.removeLayer(subwayLines)
  	};
  	if (typeof sRailLines != 'undefined'){
  		jsonLayers.removeLayer(sRailLines)
  	};
  //map.removeLayer(busLines);
  return false;
});
// Bus Funktion nicht aktiv - Performance
/*$("#bus-btn").click(function() {
  $("#loading").show();
  getBusCoords();
  return false;
});*/

/* Nutzer Lokalisierung */
$("#locate-btn").click(function() {
	$("#locateModal").modal("show");
  	map.locate({
  		setView: true,
  		watch: false,
  		timeout: 10000,
  		maximumAge: 10000,
  		enableHighAccuracy: true
	});
	function onLocationFound(e) {
	var radius = e.accuracy / 2;
	L.marker(e.latlng).addTo(map)
	.bindPopup("ungefährer Radius: " + radius + " m").openPopup();
	//L.circle(e.latlng, radius, {color: '#008000', weight: 0.7, fillColor:'#8db600' ,fillOpacity: 0.2, clickable: false}).addTo(map);
}
map.on('locationfound', onLocationFound);
   	return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});
/*  ### ############ ###  */

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
//OSM B&W
			osmBWUrl = 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
			osmMapBW = L.tileLayer(osmBWUrl, {attribution: osmAttrib, maxZoom: 20}),
//Mapbox
			mapboxLink = '<a href = "http://mapbox.com">Mapbox</a>',
			mapboxUrl = 'https://a.tiles.mapbox.com/v3/rotkelch.ib6amnh3/{z}/{x}/{y}.png',
			mapboxAttrib = 'Map data &copy; <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
			mapboxMap = L.tileLayer(mapboxUrl, {attribution: mapboxAttrib, maxZoom:20});
//	2.)	<!-- Kartencontainer wird mit einer Karte belegt und Ausschnitt, Zoomlevel bestimmt-->
	var 	map = L.map('map', {	layers: [osmMapBW]	}).setView([48.13925, 11.56536], 16);
//	3.)	<!-- Hier werden LAyer definiert- die in der Layer übersicht erschienen ->
	var 	baseMaps = {
			"OSM Mapnik": osmMap,
			"OSM Grayscale": osmMapBW,
			"Mapbox streets": mapboxMap
			};
/*// HighWays Gruppe für korrestpondierende Ebenen
	var 	corLevels = L.layerGroup();
	corLevels.addTo(map);*/
var highWaysIniLevel
var followingLevel
var precedingLevel

// LayerGroup als Container für die folgenden GeoJSON Layer
	var 	jsonLayers = L.layerGroup();
	jsonLayers.addTo(map);
//	<!-- Layerschaltflächen für Kartendienste -->
	L.control.layers(baseMaps).addTo(map);
//wird bei Seitenaufruf aufgerufen
getCoords();
getURailCoords();

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
}
jsonLayers.addTo(map);
/*  #######################  Anfang U-Bahn  ######################  */
// Koordinatenabfrage seperat für Funktion getGeoJsonSubway
function getURailCoords(){
	$( ".loading" ).show();
	var 	coords = map.getBounds();				//Koordinaten BBOX abgreifen
	var		lefttop = coords.getNorthWest();		//Koordinaten splitten linksoben
	var		rightbottom = coords.getSouthEast();	//Koordinaten splitten rechtsunten

	latLeftTopR = lefttop.lat;
	lonLeftTopR = lefttop.lng;
	latRightBtmR = rightbottom.lat;
	lonRightBtmR = rightbottom.lng;
	// Addiere/Subtrahiere Werte, damit nicht immer Daten  für GeoJSONPoi nachgeladen werden bei Kartenverschieben --> vergrößerte BBOX
	latLeftTopPlusR = parseFloat(lefttop.lat) + 0.25;
	lonLeftTopPlusR = parseFloat(lefttop.lng) - 0.25;
	latRightBtmPlusR = parseFloat(rightbottom.lat) - 0.25;
	lonRightBtmPlusR = parseFloat(rightbottom.lng) + 0.25;
	getGeoJsonSubway(latLeftTopPlusR,lonLeftTopPlusR,latRightBtmPlusR,lonRightBtmPlusR);
}

/*map.on('moveend', function(){
	var moveendCoords = map.getBounds();				//Koordinaten BBOX abgreifen
	var	newLefttop = moveendCoords.getNorthWest();		//Koordinaten splitten linksoben
	var	newRightbottom = moveendCoords.getSouthEast();
	if ((parseFloat(newLefttop.lat) >= parseFloat(latLeftTopPlus) || parseFloat(newLefttop.lng) <= parseFloat(lonLeftTopPlus) || parseFloat(newRightbottom.lat) <= parseFloat(latRightBtmPlus) || parseFloat(newRightbottom.lng) >= parseFloat(lonRightBtmPlus)) && map.getZoom() > 14){
		console.log("hello")
		getGeoJsonSubway();
	}
});*/
//Schienen
function getGeoJsonSubway(leftlat,leftlng,rightlat,rightlng){
	$("#loading").show();
	//console.log("U-Bahn-Linien ABFRAGE")
    var 	query = '<query type="node"><has-kv k="railway" modv="" v="subway"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="node-way"/><print/><union><query type="way"><has-kv k="railway" modv="" v="subway"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/><union><query type="relation"><has-kv k="ref" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query></union><print/>';
//	6.) Daten mit JQuery abgreifen und in geojson transformieren, stylen
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data){
		//console.log(data.activeElement.children)
		var geoJson = osmtogeojson(data);
			subwayLines = new L.geoJson(geoJson, {
				pointToLayer: function (feature, latlng){
					return L.circleMarker(latlng, {radius: 3, fillColor: "#ffffff", color: "#000", weight: 0.1, opacity: 1, fillOpacity: 0.8}); // siehe Funktion selectIcon
		        },
			// Poppup mit Inhalt definieren
				onEachFeature: function(feature, layer){
					// Poppup wird geladen
					layer.bindPopup('<b>' + feature.properties.tags.name + '</b>', {closeButton: false});
				},
				style: function(feature){
				//console.log(feature.properties.type);
		        //U-Bahn-Linien
		        // Hier muss eine Funktion hin die alle vorkommenden Namen aufgreift und Farben zuweist, damit diese Darstellung Überall klappt
			    if ((typeof feature.properties.relations[0] !== "undefined") && feature.properties.type === 'way'){
			    var rel0 = [feature.properties.relations[0].reltags.ref];
			    }
			    if ((typeof feature.properties.relations[1] !== "undefined") && feature.properties.type === 'way'){
			    var rel1 = [feature.properties.relations[1].reltags.ref];
				}
				if ((typeof feature.properties.relations[2] !== "undefined") && feature.properties.type === 'way'){
			    var rel2 = [feature.properties.relations[2].reltags.ref];
				}
				if ((typeof feature.properties.relations[3] !== "undefined") && feature.properties.type === 'way'){
			    var rel3 = [feature.properties.relations[3].reltags.ref];
				}
				if ((typeof feature.properties.relations[4] !== "undefined") && feature.properties.type === 'way'){
			    var rel4 = [feature.properties.relations[4].reltags.ref];
				}
				if ((typeof feature.properties.relations[5] !== "undefined") && feature.properties.type === 'way'){
			    var rel5 = [feature.properties.relations[5].reltags.ref];
				}
				if ((typeof feature.properties.relations[6] !== "undefined") && feature.properties.type === 'way'){
			    var rel6 = [feature.properties.relations[6].reltags.ref];
				}
				if ((typeof feature.properties.relations[7] !== "undefined") && feature.properties.type === 'way'){
			    var rel7 = [feature.properties.relations[7].reltags.ref];
				}
				if ((typeof feature.properties.relations[8] !== "undefined") && feature.properties.type === 'way'){
			    var rel8 = [feature.properties.relations[8].reltags.ref];
				}
				if ((typeof feature.properties.relations[9] !== "undefined") && feature.properties.type === 'way'){
			    var rel9 = [feature.properties.relations[9].reltags.ref];
				}
				if ((typeof feature.properties.relations[10] !== "undefined") && feature.properties.type === 'way'){
			    var rel10 = [feature.properties.relations[10].reltags.ref];
				}
			    relComp = [rel0, rel1, rel2, rel3, rel4, rel5, rel6, rel7, rel8, rel9, rel10];
			    //console.log(relComp);
			    	//console.log(feature);
			    	//i =  feature.properties.relations.length
			    	//j = feature.properties.relations.reltags.ref
			    	//console.log(i)
			    	//console.log(j)
/*			    	if ((typeof feature.properties.relations[1] !== "undefined")){
			    		console.log(feature.properties.relations[1].reltags)
			    	}*/
			    //if ((typeof feature.properties.relations[0] !== "undefined") && feature.properties.type === 'way'){
			   		//console.log(feature.properties.relations[1])
			    	//if ((typeof feature.properties.relations[1] !== "undefined") && feature.properties.type == 'way'){
			    	//	if ((typeof feature.properties.relations[0] !== "undefined") && feature.properties.type == 'way'){
			    	// typeof greift Fehler auf: TypeError
/*			        if (typeof feature.properties.relations[i] !== "undefined"){
			        	console.log(feature.properties.relations.length);
			        }*/
			        //i = feature.properties.relations[0]
			        //j = feature.properties.relations[1]
			        //k = feature.properties.relations[2]
			        //i.slice(0,3)
			        //console.log(feature.properties.relations[0].reltags.ref)
			    //console.log(feature)
			        //if (i){
/*			        if (k){
			        	//case feature.properties.relations[0]:
			        name = k.reltags.ref;
			        console.log('k')
			        }
			        else if (j){
			         //case feature.properties.relations[1]:
			        name = j.reltags.ref;
			        console.log('j')
			        }else if (i){
			        //case feature.properties.relations[1]:
			        name = i.reltags.ref;
					console.log('i')
					}*/

				//for(var i in relComp){
						//console.log(feature.properties.relations[i].reltags.ref.next)
					//if (!feature.properties.relations[i]) continue;
						name = relComp;
						//var len =  feature.properties.relations.length
						//console.log(feature.properties.relations[i].rel);
						//console.log(feature.properties.relations);
					//console.log(name);
			        if  (name.match('1')){
			        	//console.log(name);
			            return {color: '#228A00', weight: 4, opacity: 0.5};
			        }if (name.match('2')){
			            return {color: '#8A0037', weight: 4, opacity: 0.5};
			        }if (name.match('3')){
			            return {color: '#FF9500', weight: 4, opacity: 0.5};
			        }if (name.match('4')){
			            return {/*dashArray: '4,8', */color: '#00D6A0', weight: 4, opacity: 0.5};
			        }if (name.match('5')){
			            return {/*dashArray: '2,5',*/ color: '#996300', weight: 4, opacity: 0.5};
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
				//}
			//}
			}
    	});
		//der Karte hinzufügen
		$("#loading").hide();
		//Direkt der Karte hinzufügen:
  		//subwayLines.addTo(map);
  		//Indirekt (über Container):
  		subwayLines.addTo(jsonLayers);
//});
});
}
/*  #######################  Ende getGeoJsonSubway  ######################  */

/*  #######################  Anfang S-Bahn  ######################  */
// Koordinatenabfrage seperat für Funktion getGeoJsonSRail
function getSRailCoords(){
	$( ".loading" ).show();
	var 	coords = map.getBounds();				//Koordinaten BBOX abgreifen
	var		lefttop = coords.getNorthWest();		//Koordinaten splitten linksoben
	var		rightbottom = coords.getSouthEast();	//Koordinaten splitten rechtsunten

	latLeftTop = lefttop.lat;
	lonLeftTop = lefttop.lng;
	latRightBtm = rightbottom.lat;
	lonRightBtm = rightbottom.lng;
	// Addiere/Subtrahiere Werte, damit nicht immer Daten  für GeoJSONPoi nachgeladen werden bei Kartenverschieben --> vergrößerte BBOX
	latLeftTopPlusR = parseFloat(lefttop.lat) + 0.10;
	lonLeftTopPlusR = parseFloat(lefttop.lng) - 0.10;
	latRightBtmPlusR = parseFloat(rightbottom.lat) - 0.10;
	lonRightBtmPlusR = parseFloat(rightbottom.lng) + 0.10;
	getGeoJsonSRail(latLeftTopPlusR,lonLeftTopPlusR,latRightBtmPlusR,lonRightBtmPlusR);
}

function getGeoJsonSRail(leftlat,leftlng,rightlat,rightlng){
	$("#loading").show();
	//console.log("U-Bahn-Linien ABFRAGE")
    var 	query = '<query type="node"><has-kv k="railway" modv="" v="rail"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="node-way"/><print/><union><query type="way"><has-kv k="railway" modv="" v="rail"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/><union><query type="relation"><has-kv k="ref" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query></union><print/>';
//	6.) Daten mit JQuery abgreifen und in geojson transformieren, stylen
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data){
		//console.log(data.activeElement.children)
		var geoJson = osmtogeojson(data);
		sRailLines = new L.geoJson(geoJson, {
			pointToLayer: function (feature, latlng){
				return L.circleMarker(latlng, {radius: 3, fillColor: "#ffffff", color: "#000", weight: 0.1, opacity: 1, fillOpacity: 0.8}); // siehe Funktion selectIcon
	        },
		// Poppup mit Inhalt definieren
			onEachFeature: function(feature, layer){
				// Poppup wird geladen
				layer.bindPopup('<b>' + feature.properties.tags.name + '</b>', {closeButton: false});
			},
			style: function(feature){
			//console.log(feature.properties.type);
	        //U-Bahn-Linien
	        // Hier muss eine Funktion hin die alle vorkommenden Namen aufgreift und Farben zuweist, damit diese Darstellung Überall klappt
		    if ((typeof feature.properties.relations[0] !== "undefined") && feature.properties.type === 'way'){
		    var rel0 = [feature.properties.relations[0].reltags.ref];
		    }
		    if ((typeof feature.properties.relations[1] !== "undefined") && feature.properties.type === 'way'){
		    var rel1 = [feature.properties.relations[1].reltags.ref];
			}
			if ((typeof feature.properties.relations[2] !== "undefined") && feature.properties.type === 'way'){
		    var rel2 = [feature.properties.relations[2].reltags.ref];
			}
			if ((typeof feature.properties.relations[3] !== "undefined") && feature.properties.type === 'way'){
		    var rel3 = [feature.properties.relations[3].reltags.ref];
			}
			if ((typeof feature.properties.relations[4] !== "undefined") && feature.properties.type === 'way'){
		    var rel4 = [feature.properties.relations[4].reltags.ref];
			}
			if ((typeof feature.properties.relations[5] !== "undefined") && feature.properties.type === 'way'){
		    var rel5 = [feature.properties.relations[5].reltags.ref];
			}
			if ((typeof feature.properties.relations[6] !== "undefined") && feature.properties.type === 'way'){
		    var rel6 = [feature.properties.relations[6].reltags.ref];
			}
			if ((typeof feature.properties.relations[7] !== "undefined") && feature.properties.type === 'way'){
		    var rel7 = [feature.properties.relations[7].reltags.ref];
			}
			if ((typeof feature.properties.relations[8] !== "undefined") && feature.properties.type === 'way'){
		    var rel8 = [feature.properties.relations[8].reltags.ref];
			}
			if ((typeof feature.properties.relations[9] !== "undefined") && feature.properties.type === 'way'){
		    var rel9 = [feature.properties.relations[9].reltags.ref];
			}
			if ((typeof feature.properties.relations[10] !== "undefined") && feature.properties.type === 'way'){
		    var rel10 = [feature.properties.relations[10].reltags.ref];
			}
		    relComp = [rel0, rel1, rel2, rel3, rel4, rel5, rel6, rel7, rel8, rel9, rel10];

			name = relComp;

			//console.log(name);
	        if  (name.match('1')){
	        	//console.log(name);
	            return {color: '#228A00', weight: 4, opacity: 0.5};
	        }if (name.match('2')){
	            return {color: '#8A0037', weight: 4, opacity: 0.5};
	        }if (name.match('3')){
	            return {color: '#FF9500', weight: 4, opacity: 0.5};
	        }if (name.match('4')){
	            return {/*dashArray: '4,8', */color: '#00D6A0', weight: 4, opacity: 0.5};
	        }if (name.match('5')){
	            return {/*dashArray: '2,5',*/ color: '#996300', weight: 4, opacity: 0.5};
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
//der Karte hinzufügen
$("#loading").hide();
//sRailLines.addTo(map);
sRailLines.addTo(jsonLayers);
});
}
/*  #######################  Ende getGeoJsonSRail  ######################  */

/*  #######################  Anfang Tram  ######################  */
// Koordinatenabfrage seperat für Funktion getGeoJsonTram
function getTramCoords(){
	$( ".loading" ).show();
	var 	coords = map.getBounds();				//Koordinaten BBOX abgreifen
	var		lefttop = coords.getNorthWest();		//Koordinaten splitten linksoben
	var		rightbottom = coords.getSouthEast();	//Koordinaten splitten rechtsunten

	latLeftTop = lefttop.lat;
	lonLeftTop = lefttop.lng;
	latRightBtm = rightbottom.lat;
	lonRightBtm = rightbottom.lng;
	// Addiere/Subtrahiere Werte, damit nicht immer Daten  für GeoJSONPoi nachgeladen werden bei Kartenverschieben --> vergrößerte BBOX
	latLeftTopPlusR = parseFloat(lefttop.lat) + 0.10;
	lonLeftTopPlusR = parseFloat(lefttop.lng) - 0.10;
	latRightBtmPlusR = parseFloat(rightbottom.lat) - 0.10;
	lonRightBtmPlusR = parseFloat(rightbottom.lng) + 0.10;
	getGeoJsonTram(latLeftTopPlusR,lonLeftTopPlusR,latRightBtmPlusR,lonRightBtmPlusR);
}

function getGeoJsonTram(leftlat,leftlng,rightlat,rightlng){
	$("#loading").show();
	//console.log("U-Bahn-Linien ABFRAGE")
    var 	query = '<query type="node"><has-kv k="railway" modv="" v="tram"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="node-way"/><print/><union><query type="way"><has-kv k="railway" modv="" v="tram"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/><union><query type="relation"><has-kv k="ref" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query></union><print/>';
//	6.) Daten mit JQuery abgreifen und in geojson transformieren, stylen
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data){
		//console.log(data.activeElement.children)
		var geoJson = osmtogeojson(data);
		tramLines = new L.geoJson(geoJson, {
			pointToLayer: function (feature, latlng){
				return L.circleMarker(latlng, {radius: 1, fillColor: "#ffffff", color: "#000", weight: 0.1, opacity: 1, fillOpacity: 0.8}); // siehe Funktion selectIcon
	        },
		// Poppup mit Inhalt definieren
			onEachFeature: function(feature, layer){
				// Poppup wird geladen
				layer.bindPopup('<b>' + feature.properties.tags.name + '</b>', {closeButton: false});
			},
			style: function(feature){
			//console.log(feature.properties.type);
	        //U-Bahn-Linien
	        // Hier muss eine Funktion hin die alle vorkommenden Namen aufgreift und Farben zuweist, damit diese Darstellung Überall klappt
		    if ((typeof feature.properties.relations[0] !== "undefined") && feature.properties.type === 'way'){
		    var rel0 = [feature.properties.relations[0].reltags.ref];
		    }
		    if ((typeof feature.properties.relations[1] !== "undefined") && feature.properties.type === 'way'){
		    var rel1 = [feature.properties.relations[1].reltags.ref];
			}
			if ((typeof feature.properties.relations[2] !== "undefined") && feature.properties.type === 'way'){
		    var rel2 = [feature.properties.relations[2].reltags.ref];
			}
			if ((typeof feature.properties.relations[3] !== "undefined") && feature.properties.type === 'way'){
		    var rel3 = [feature.properties.relations[3].reltags.ref];
			}
			if ((typeof feature.properties.relations[4] !== "undefined") && feature.properties.type === 'way'){
		    var rel4 = [feature.properties.relations[4].reltags.ref];
			}
			if ((typeof feature.properties.relations[5] !== "undefined") && feature.properties.type === 'way'){
		    var rel5 = [feature.properties.relations[5].reltags.ref];
			}
			if ((typeof feature.properties.relations[6] !== "undefined") && feature.properties.type === 'way'){
		    var rel6 = [feature.properties.relations[6].reltags.ref];
			}
			if ((typeof feature.properties.relations[7] !== "undefined") && feature.properties.type === 'way'){
		    var rel7 = [feature.properties.relations[7].reltags.ref];
			}
			if ((typeof feature.properties.relations[8] !== "undefined") && feature.properties.type === 'way'){
		    var rel8 = [feature.properties.relations[8].reltags.ref];
			}
			if ((typeof feature.properties.relations[9] !== "undefined") && feature.properties.type === 'way'){
		    var rel9 = [feature.properties.relations[9].reltags.ref];
			}
			if ((typeof feature.properties.relations[10] !== "undefined") && feature.properties.type === 'way'){
		    var rel10 = [feature.properties.relations[10].reltags.ref];
			}
		    relComp = [rel0, rel1, rel2, rel3, rel4, rel5, rel6, rel7, rel8, rel9, rel10];

			name = relComp;

			//console.log(name);
	        if  (name.match('1')){
	        	//console.log(name);
	            return {color: '#228A00', weight: 4, opacity: 0.5};
	        }if (name.match('2')){
	            return {color: '#8A0037', weight: 4, opacity: 0.5};
	        }if (name.match('3')){
	            return {color: '#FF9500', weight: 4, opacity: 0.5};
	        }if (name.match('4')){
	            return {/*dashArray: '4,8', */color: '#00D6A0', weight: 4, opacity: 0.5};
	        }if (name.match('5')){
	            return {/*dashArray: '2,5',*/ color: '#996300', weight: 4, opacity: 0.5};
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
//der Karte hinzufügen
$("#loading").hide();
//tramLines.addTo(map);
tramLines.addTo(jsonLayers);
});
}
/*  #######################  Ende getGeoJsonTram  ######################  */

/*  #######################  Anfang Bus  ######################  */
// Koordinatenabfrage seperat für Funktion getGeojsonBus
function getBusCoords(){
	$( ".loading" ).show();
	var 	coords = map.getBounds();				//Koordinaten BBOX abgreifen
	var		lefttop = coords.getNorthWest();		//Koordinaten splitten linksoben
	var		rightbottom = coords.getSouthEast();	//Koordinaten splitten rechtsunten

	latLeftTop = lefttop.lat;
	lonLeftTop = lefttop.lng;
	latRightBtm = rightbottom.lat;
	lonRightBtm = rightbottom.lng;
	// Addiere/Subtrahiere Werte, damit nicht immer Daten  für GeoJSONPoi nachgeladen werden bei Kartenverschieben --> vergrößerte BBOX
	latLeftTopPlus = parseFloat(lefttop.lat) + 0.10;
	lonLeftTopPlus = parseFloat(lefttop.lng) - 0.10;
	latRightBtmPlus = parseFloat(rightbottom.lat) - 0.10;
	lonRightBtmPlus = parseFloat(rightbottom.lng) + 0.10;
	getGeojsonBus(latLeftTopPlus,lonLeftTopPlus,latRightBtmPlus,lonRightBtmPlus);
}

function getGeojsonBus(leftlat,leftlng,rightlat,rightlng){
	$("#loading").show();
	//console.log("U-Bahn-Linien ABFRAGE")
    var 	query = '<query type="node"><has-kv k="highway" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="node-way"/><print/><union><query type="way"><has-kv k="highway" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/><union><query type="relation"><has-kv k="ref" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query></union><print/>';
//	6.) Daten mit JQuery abgreifen und in geojson transformieren, stylen
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data){
		//console.log(data.activeElement.children)
		var geoJson = osmtogeojson(data);
		busLines = new L.geoJson(geoJson, {
			pointToLayer: function (feature, latlng){
				return L.circleMarker(latlng, {radius: 1, fillColor: "#ffffff", color: "#000", weight: 0.1, opacity: 1, fillOpacity: 0.8}); // siehe Funktion selectIcon
	        },
		// Poppup mit Inhalt definieren
			onEachFeature: function(feature, layer){
				// Poppup wird geladen
				layer.bindPopup('<b>' + feature.properties.tags.name + '</b>', {closeButton: false});
			},
			style: function(feature){
			//console.log(feature.properties.type);
	        //U-Bahn-Linien
	        // Hier muss eine Funktion hin die alle vorkommenden Namen aufgreift und Farben zuweist, damit diese Darstellung Überall klappt
		    if ((typeof feature.properties.relations[0] !== "undefined") && feature.properties.type === 'way'){
		    var rel0 = [feature.properties.relations[0].reltags.ref];
		    }
		    if ((typeof feature.properties.relations[1] !== "undefined") && feature.properties.type === 'way'){
		    var rel1 = [feature.properties.relations[1].reltags.ref];
			}
			if ((typeof feature.properties.relations[2] !== "undefined") && feature.properties.type === 'way'){
		    var rel2 = [feature.properties.relations[2].reltags.ref];
			}
			if ((typeof feature.properties.relations[3] !== "undefined") && feature.properties.type === 'way'){
		    var rel3 = [feature.properties.relations[3].reltags.ref];
			}
			if ((typeof feature.properties.relations[4] !== "undefined") && feature.properties.type === 'way'){
		    var rel4 = [feature.properties.relations[4].reltags.ref];
			}
			if ((typeof feature.properties.relations[5] !== "undefined") && feature.properties.type === 'way'){
		    var rel5 = [feature.properties.relations[5].reltags.ref];
			}
			if ((typeof feature.properties.relations[6] !== "undefined") && feature.properties.type === 'way'){
		    var rel6 = [feature.properties.relations[6].reltags.ref];
			}
			if ((typeof feature.properties.relations[7] !== "undefined") && feature.properties.type === 'way'){
		    var rel7 = [feature.properties.relations[7].reltags.ref];
			}
			if ((typeof feature.properties.relations[8] !== "undefined") && feature.properties.type === 'way'){
		    var rel8 = [feature.properties.relations[8].reltags.ref];
			}
			if ((typeof feature.properties.relations[9] !== "undefined") && feature.properties.type === 'way'){
		    var rel9 = [feature.properties.relations[9].reltags.ref];
			}
			if ((typeof feature.properties.relations[10] !== "undefined") && feature.properties.type === 'way'){
		    var rel10 = [feature.properties.relations[10].reltags.ref];
			}
		    relComp = [rel0, rel1, rel2, rel3, rel4, rel5, rel6, rel7, rel8, rel9, rel10];

			name = relComp;

			//console.log(name);
	        if  (name.match('1')){
	        	//console.log(name);
	            return {color: '#228A00', weight: 4, opacity: 0.5};
	        }if (name.match('2')){
	            return {color: '#8A0037', weight: 4, opacity: 0.5};
	        }if (name.match('3')){
	            return {color: '#FF9500', weight: 4, opacity: 0.5};
	        }if (name.match('4')){
	            return {/*dashArray: '4,8', */color: '#00D6A0', weight: 4, opacity: 0.5};
	        }if (name.match('5')){
	            return {/*dashArray: '2,5',*/ color: '#996300', weight: 4, opacity: 0.5};
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
//der Karte hinzufügen
$("#loading").hide();
busLines.addTo(map);
});
}
/*  #######################  Ende getGeoJsonSRail  ######################  */
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
		// Koordinaten für aktuellen Kartenausschnitt beziehen
		var 	coordsID = map.getBounds();				//Koordinaten BBOX abgreifen
		var		lefttopID = coordsID.getNorthWest();		//Koordinaten splitten linksoben
		var		rightbottomID = coordsID.getSouthEast();	//Koordinaten splitten rechtsunten

		latLeftTopID = lefttopID.lat;
		lonLeftTopID = lefttopID.lng;
		latRightBtmID = rightbottomID.lat;
		lonRightBtmID = rightbottomID.lng;
		// Rufe Funktion auf um GeoJSon Indoor Daten zu beziehen
		getGeojsonData(latLeftTopID, lonLeftTopID, latRightBtmID, lonRightBtmID);
		console.log(latLeftTop, lonLeftTop, latRightBtm, lonRightBtm);
		console.log(latLeftTopID, lonLeftTopID, latRightBtmID, lonRightBtmID);
		console.log("stationPois onClick --> removerLayer stationPois");
		map.removeLayer(stationPois);	//StationPOIs daten löschen
		//stationPois.clearLayers();
		//Karte mit Transparenz versehen
		osmMap.setOpacity(0.2);
		mapboxMap.setOpacity(0.2);
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
    }if(feat.properties.tags.highway === 'elevator'){
    	return L.marker(lalo, {icon: wheelchair})
    }else{
    // Wenn kein ICON vorhanden mache ein CIRCLEICON siehe geoJsonMarkerOptions
    	return L.circleMarker(lalo, geojsonMarkerOptions)
    }
};

function selectIndoorIcon(feat, lalo){
	//return L.marker(latlng, {icon: metroIcon});
	if (feat.properties.tags.amenity === 'fast_food'){
		return L.marker(lalo, {icon: fast_food})
	}else if (feat.properties.tags.amenity === 'pharmacy'){
    	return L.marker(lalo, {icon: pharmacy})
    }if(feat.properties.tags.highway === 'elevator'){
    	return L.marker(lalo, {icon: wheelchair})
    }if(feat.properties.tags.highway === 'lift'){
		return L.marker(lalo, {icon: wheelchair})
    }if(feat.properties.tags.railway === 'subway_entrance'){
    	return L.marker(lalo, {icon: entrance})
    }else{
    // Wenn kein ICON vorhanden mache ein CIRCLEICON siehe geoJsonMarkerOptions
    	return L.circleMarker(lalo, geojsonMarkerOptions)
    }
};

//Styling der Punkte
var geojsonMarkerOptions = {
		radius: 2,
	    fillColor: "#ffffff",
	    color: "#000",
	    weight: 0.1,
	    opacity: 1,
	    fillOpacity: 0.8
};

{/*
}* ##### DATA #####
* Daten über Overpass API abfragen und in GEOJSON Daten transformieren -> INdoor Daten
*/
function getGeojsonData(leftlat,leftlng,rightlat,rightlng){
	$("#loading").show();
//console.log(leftlat,leftlng,rightlat,rightlng);
    var 	query = '<union><query type="node"><has-kv k="level" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><query type="way"><has-kv k="level" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><query type="relation"><has-kv k="level" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query></union><union><item/><recurse type="down"/><recurse type="way-relation"/><recurse type="node-relation"/></union><print/>';
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
	console.log(geoJSON);
	indoorLayer = new L.Indoor(geoJSON, {
		getLevel: function(feature) {
/*			if (feature.properties.relations.length === 0)
				return null;*/
			if (feature.properties.tags.length === 0)
				return null;

				//return feature.properties.tags.level;
				//return feature.properties.relations[0].reltags.level;
				//return feature.properties.relations[1].reltags.level;
				return feature.properties.tags.level;
				//return feature.properties.relations[1].reltags.level;
		},	//PointtoLayer macht das keine dominanten Marker für Punktobjekte ausgegeben werden!
		pointToLayer: function (feature, latlng){
            //return L.circleMarker(latlng, geojsonMarkerOptions);
            return selectIndoorIcon(feature, latlng);
        },
// Aussehen der GeoJson Daten definieren
        style: function(feature){
        //Nicht ausgeben:
        	if (feature.properties.tags.waterway){
        		return {fillColor: 'none', color: 'none', weight: 1, fillOpacity: 1};
	        }
	    //...
        //Verkehr
	        //PLattform
	        if (feature.properties.tags.public_transport === 'platform'){
	            return {fillColor: '#FBEF69', color: '#333333', weight: 1, fillOpacity: 1};
	        }
	        if (feature.properties.tags.public_transport === 'stop_area'){
	            return {fillColor: '#FBEF69', color: '#333333', weight: 1, fillOpacity: 1};
	        }/*	//Schiene, --> wird in Funktion geoJsonLine behanfdelt..
        	if (feature.properties.tags.railway === 'rail'){
        		return {color: '#FA6666', weight: 9};
        	}
        	if (feature.properties.tags.railway === 'subway') {
        		return {color: '#FA6666', weight: 9};
        	}	//Schiene
        	if (feature.properties.tags.railway === 'proposed'){
        		return {color: '#FA6666', weight: 9};
			}*/
        //Ausstattung
        	//RolltreppeN
	        if (feature.properties.tags.conveying === 'forward'){
	            return {dashArray: '5,5', color: '#DBE81E', opacity: 1, weight: 2, zIndex: 1, lineJoin: 'miter'};
    		}
    		if (feature.properties.tags.conveying === 'backward'){
	            return {dashArray: '5,5', color: '#5CAD0A', opacity: 1, weight: 2, zIndex: 1, lineJoin: 'miter'};
    		}
    		if (feature.properties.tags.conveying === 'reversible'){
	            return {dashArray: '5,5', color: '#6BC40C', opacity: 1, weight: 2, zIndex: 1, lineJoin: 'miter'};
    		}
    		if (feature.properties.tags.conveying === 'yes'){
	            return {dashArray: '5,5', color: '#6BC40C', opacity: 1, weight: 2, zIndex: 1, lineJoin: 'miter'};
    		}
    		if (feature.properties.tags.escalator_dir === 'up'){
	            return {dashArray: '5,5', color: '#DBE81E', opacity: 1, weight: 2, zIndex: 1, lineJoin: 'miter'};
    		}
    		if (feature.properties.tags.escalator_dir === 'down'){
	            return {dashArray: '5,5', color: '#5CAD0A', opacity: 1, weight: 2, zIndex: 1, lineJoin: 'miter'};
    		}
    		if (feature.properties.tags.escalator_dir === 'dynamic'){
	            return {dashArray: '5,5', color: '#6BC40C', opacity: 1, weight: 2, zIndex: 1, lineJoin: 'miter'};
    		}
    		if (feature.properties.tags.escalator === 'parallel'){
	            return {dashArray: '5,5', color: '#6BC40C', opacity: 1, weight: 2, zIndex: 1, lineJoin: 'miter'};
    		}
    		if (feature.properties.tags.escalator === 'yes'){
	            return {dashArray: '5,5', color: '#6BC40C', opacity: 1, weight: 2, zIndex: 1, lineJoin: 'miter'};
    		}
    		//Treppe
    		if (feature.properties.tags.highway === 'steps'){
	            return {dashArray: '5,5', color: '#99CC00', opacity: 1, weight: 2, zIndex: 1};
    		}	//Fußwege
	        if (feature.properties.tags.highway === 'footway'){
	            return {color: '#99CC00', opacity: 1, weight: 1};
            }
            if (feature.properties.tags.highway === 'pedestrian' && feature.properties.tags.area === 'yes'){
	            return {color: '#e1ff87', opacity: 1, weight: 1, fillOpacity: 1};
            }
            if (feature.properties.tags.highway === 'pedestrian'){
	            return {color: '#99CC00', opacity: 1, weight: 1};
            }
            if (feature.properties.tags.highway === 'residential'){
	            return {color: '#e1ff87', opacity: 1, weight: 1};
            }
            if (feature.properties.tags.area === 'footway'){
	            return {color: '#e1ff87', opacity: 1, weight: 1};
            }
            if (feature.properties.tags.highway === 'path'){
	            return {color: '#99CC00', opacity: 1, weight: 1};
            }
            if (feature.properties.tags.foot === 'yes'){
	            return {color: '#99CC00', opacity: 1, weight: 1};
            }
            //Aufzug
            if (feature.properties.tags.highway === 'elevator' && feature.properties.tags.building === 'yes' ){
	            return {fillColor: '#99cc00', color: '#FFFFFF', weight: 1, fillOpacity: 1};
        	}
	        if (feature.properties.tags.highway === 'elevator'){
	            return {fillColor: '#99cc00', color: '#FFFFFF', weight: 1, fillOpacity: 1};
        	}
        	if (feature.properties.tags.levelpart === 'elevator_platform'){
	            return {fillColor: '#99cc00', color: '#FFFFFF', weight: 1, fillOpacity: 1};
        	}
        	//erweiterte Einrichtung
        	if (feature.properties.tags.amentiy === 'police'){
	            return {fillColor: '#2962ff', color: '#FFFFFF', weight: 1, fillOpacity: 1};
            }
        	if (feature.properties.tags.information === 'office'){
	            return {fillColor: '#ffffb5', color: '#FFFFFF', weight: 1, fillOpacity: 1};
            }
            if (feature.properties.tags.tourism === 'information'){
	            return {fillColor: '#ffffb5', color: '#FFFFFF', weight: 1, fillOpacity: 1};
            }
        		//Essen
			if (feature.properties.tags.shop === 'food'){
	            return {fillColor: '#FBDDFB', color: '#FFFFFF', weight: 1, fillOpacity: 1};
            }	//Bäckerei
        	if (feature.properties.tags.shop === 'bakery'){
	            return {fillColor: '#FBDDFB', color: '#FFFFFF', weight: 1, fillOpacity: 1};
	        }	//Geschäft
            if (feature.properties.tags.shop === 'yes'){
	           	return {fillColor: '#FFC1BE', color: '#FFFFFF', weight: 1, fillOpacity: 1};
	        }	//Telefon
	        if (feature.properties.tags.shop === 'mobile_phone'){
	        	return {fillColor: '#FFC1BE', color: '#FFFFFF', weight: 1, fillOpacity: 1};
	        }	//SHOP
	        if (feature.properties.tags.shop){
	        	return {fillColor: '#FFC1BE', color: '#FFFFFF', weight: 1, fillOpacity: 1};
			}	//FAst_Food
	        if (feature.properties.tags.amenity === 'fast_food'){
	        	return {fillColor: '#FBDDFB', color: '#FFFFFF', weight: 1, fillOpacity: 1};
	        }	//Einrichtung
	        if (feature.properties.tags.amenity){
	        	return {fillColor: '#ffcc99', color: '#FFFFFF', weight: 1, fillOpacity: 1};
        	}	//Einrichtung
        	if (feature.properties.tags.amenity === 'yes'){
        		return {fillColor: '#FFF0FF', color: '#FFFFFF', weight: 1, fillOpacity: 1};
	        } 	//Tunnel
	        if (feature.properties.tags.tunnel === 'yes'){
	            return {fillColor: '#f0f8ff', color: '#FFFFFF', weight: 2, fillOpacity: 1};
	        }	//Sicherheitsdienst
			if (feature.properties.tags.description === 'security service') {
	            return {fillColor: '#f6f6f6', color: '#FFFFFF', weight: 1, fillOpacity: 1};
	        }	//Fläche allgemein
	        if(feature.properties.tags.area === 'yes'){
	        	return {fillColor: '#CED7E0', color: '#FFFFFF', weight: 2, fillOpacity: 1};
	        }
	        //Gebäude
        	if (feature.properties.tags.building === 'train_station'){
	            return {fillColor: '#c5cbd9', color: '#333333', weight: 1, fillOpacity: 1};
	        }
	        if (feature.properties.tags.building === 'yes'){
	            return {fillColor: '#ffbaba', color: '#333333', weight: 1, fillOpacity: 1};
	        }
	        if (typeof feature.properties.relations[0] !== 'undefined'){
	        	if (feature.properties.relations[0].reltags.building === 'train_station'){
	            	return {fillColor: '#c5cbd9', color: '#333333', weight: 1, fillOpacity: 1};
	        	}
	        	if (feature.properties.relations[0].reltags.building === 'train_station'){
	            	return {fillColor: '#c5cbd9', color: '#333333', weight: 1, fillOpacity: 1};
	        	}
	        	if (feature.properties.tags.amenity === 'townhall'){
	            	return {fillColor: '#e9b8ff', color: '333333', weight: 1, fillOpacity: 1};
	        	}
	        	if (feature.properties.tags.building === 'roof'){
	            	return {fillColor: '#ffbaba', color: '333333', weight: 1, fillOpacity: 1};
	        	}
	        }
	        if (feature.properties.tags.landuse === 'railway'){
	            return {fillColor: '#fff1ba', color: 'none', weight: 1, fillOpacity: 1};
	        }
	        if (feature.properties.tags.amenity === 'townhall'){
	            return {fillColor: '#e9b8ff', color: '333333', weight: 1, fillOpacity: 1};
	        }//DAch
	        if (feature.properties.tags.building === 'roof'){
	            return {fillColor: '#ffbaba', color: '333333', weight: 1, fillOpacity: 1};
	        }
	        //ohne Tags
/*	        else{
	        	return ;
	        }*/
		},// Ende Style
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
				var popupContent = '<caption><h5>' + name + '</h5></caption>';

				if (description){
					description = '<td colspan="2">' + description + '</td>';
					popupContent += description;
				}
/*				if (street && houseNr) {
					street = '<br \/>' + "<tr><td>Open:\t  </td><td>"+  street + ' ' + houseNr +  '</td></tr></b>';
					adressInfo += street;
				};*/
				if (opening){
					opening =  '<tr><td><i>Offen: &nbsp;</i></td><td>' + opening + '</td></tr>';
					popupContent += opening;
				}
				if (phone){
					phone = phone;
					popupContent += '<tr><td><i>Telefon:&nbsp;</i></td><td>' + phone + '</td></tr>';
				}
				if (website){
					website = website.link(String(website));
					popupContent += '<tr><td><i>Web: &nbsp;</i></td><td>' + website + '</td></tr>';
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
			};
		// ### Feature auf dem der Mauszeiger liegt soll hervorgehoben werden
		    layer.on('mouseover', function() {
            	layer.setStyle({fillOpacity: 0.5});
            });
            layer.on('mouseout', function() {
                layer.setStyle({fillOpacity: 1});
            });
		}// Ende OnEachFeature
   });

	//map.removeLayer(stationPois);
	//stationPois.clearLayers();
// Indoor Layer auf null setzen und IndoorLayer zur Karte hinzufügen
    indoorLayer.setLevel("0");
    indoorLayer.addTo(map);
    getGeojsonHighways(latLeftTopID, lonLeftTopID, latRightBtmID, lonRightBtmID);
    $("#loading").hide();
//LevelControl anlegen und mit Level info aus IndoorLayer füllen
    levelControl = new L.Control.Level({
        level: "0",
        levels: indoorLayer.getLevels()
    });
// Level-Schaltflächen mit Indoor-Layer verknüpfen
    levelControl.addEventListener("levelchange", indoorLayer.setLevel, indoorLayer);
    levelControl.addTo(map);
    //console.log(indoorLayer.getLevel());
	//console.log(map.hasLayer(indoorLayer));
	});
}
}

//Funktion um Wege auf den korrespondierenden Leveln auszugeben
function getGeojsonHighways(leftlat,leftlng,rightlat,rightlng){
    var 	query = '<union><query type="node"><has-kv k="highway" modv="" regv="footway|steps"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><query type="way"><has-kv k="highway" modv="" regv="footway|steps"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><query type="relation"><has-kv k="highway" modv="" regv="footway|steps"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query></union><union><item/><recurse type="down"/></union><print/>';
//	Daten mit JQuery abgreifen und in geojson transformieren, stylen
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data){
		var geoJSON = osmtogeojson(data);
		highWays = new L.Indoor(geoJSON, {
	   		getLevel: function(feature) {
				if (feature.properties.tags.length === 0)
					return null;
					return feature.properties.tags.level;
			},
			// Aussehen
			style: function(feature) {
				if (feature.properties.tags.highway === 'footway'){
					return {color: 'white', weight: 3, opacity: 0.5};
				}
				if (feature.properties.tags.highway === 'steps'){
					return {color: 'white', weight: 2, opacity: 0.5, dashArray: 3.3};
				}
			},
	//PointtoLayer macht das keine dominanten Marker für Punktobjekte ausgegeben werden!
			pointToLayer: function (feature, latlng){
	            //return L.circleMarker(latlng, geojsonMarkerOptions);
	            return selectIndoorIcon(feature, latlng);
	    	}
		});
		//console.log(highWays);
		//levelControl.addEventListener("levelchange", actLevel);
		var highWaysIni = jQuery.extend(true, {}, highWays);
		//var highWaysIniD = jQuery.extend(true, {}, highWays);
		//highWaysIni.setLevel("-1");
		levelControl.addEventListener("levelchange", highWaysIni.setLevel, highWaysIni);
		levelControl.addEventListener("levelchange", actLevel, highWaysIni);
		highWaysFollowing = jQuery.extend(true, {}, highWaysIni);
		//der Karte hinzufügen
		highWaysFollowing.addTo(map);
		//highWaysPreceding.addTo(map);
	function actLevel(){
		highWaysIniLevel = highWaysIni.getLevel();
		//highWaysIniLevel2= highWaysIni.getLevel();
		console.log(highWaysIni.getLevel());
		//console.log(highWaysIniLevel);
		/*if (typeof highWaysFollowing !== 'undefined'){
			map.removeLayer(highWaysFollowing);
		}
		if (typeof highWaysPreceding !== 'undefined'){
			map.removeLayer(highWaysPreceding);
		}*/
		highWaysFollowing.setLevel(++highWaysIniLevel);
		//highWaysPreceding.setLevel(++highWaysIniLevel2);
		console.log(highWaysFollowing.getLevel());
		//console.log(highWaysPreceding.getLevel());
		//map.removeLayer(highWaysIni);
	}
//## Beginn UNTERE Highways-Ebene
	var geoJSONc = osmtogeojson(data);
	highWaysD = new L.Indoor(geoJSONc, {
   		getLevel: function(feature) {
			if (feature.properties.tags.length === 0)
				return null;
				return feature.properties.tags.level;
		},
		// Aussehen
		style: function(feature) {
			if (feature.properties.tags.highway === 'footway'){
				return {color: '#939393', weight: 3, opacity: 0.4};
			}
			if (feature.properties.tags.highway === 'steps'){
				return {color: '#939393', weight: 2, opacity: 0.4, dashArray: 3.3};
			}
		},
//PointtoLayer macht das keine dominanten Marker für Punktobjekte ausgegeben werden!
		pointToLayer: function (feature, latlng){
            //return L.circleMarker(latlng, geojsonMarkerOptions);
            return selectIndoorIcon(feature, latlng);
    	}
	});
		//console.log(highWays);
		//levelControl.addEventListener("levelchange", actLevel);
		var highWaysIniD = jQuery.extend(true, {}, highWaysD);
		highWaysIniD.setLevel("-1");
		//der Karte hinzufügen
		//highWaysIniD.addTo(map);
		levelControl.addEventListener("levelchange", highWaysIniD.setLevel, highWaysIniD);
		levelControl.addEventListener("levelchange", actLevelD, highWaysIniD);
		highWaysPreceding = jQuery.extend(true, {}, highWaysIniD);
		//highWaysPreceding.setStyle({color: '#7FFF69', weight: 3, opacity: 0.8});
		highWaysPreceding.addTo(map);
		function actLevelD(){
			highWaysIniLevel2 = highWaysIniD.getLevel();
			console.log(highWaysIniD.getLevel());
			//console.log(highWaysIniLevel);
			/*if (typeof highWaysFollowing !== 'undefined'){
				map.removeLayer(highWaysFollowing);
			}
			if (typeof highWaysPreceding !== 'undefined'){
				map.removeLayer(highWaysPreceding);
			}*/
			highWaysPreceding.setLevel(--highWaysIniLevel2);
			console.log(highWaysPreceding.getLevel());
			//map.removeLayer(highWaysIni);
		}
	});// Ende $
};// Ende getGeojsonHighways

function catchGeoJson(subwayLines, sRailLines, tramLines){
	if (map.hasLayer(subwayLines)){
		getGeoJsonSubway(latLeftTopPlusR,lonLeftTopPlusR,latRightBtmPlusR,lonRightBtmPlusR);
	}else if (map.hasLayer(sRailLines)){
		getGeoJsonSRail(latLeftTopPlusR,lonLeftTopPlusR,latRightBtmPlusR,lonRightBtmPlusR);
	}else if (map.hasLayer(tramLines)){
		getGeoJsonTram(latLeftTopPlusR,lonLeftTopPlusR,latRightBtmPlusR,lonRightBtmPlusR);
	}else {
		getGeoJsonSubway(latLeftTopPlusR,lonLeftTopPlusR,latRightBtmPlusR,lonRightBtmPlusR);
	}
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
	//var currentView = map.getBounds();
	// Wenn außerhalb des Koordinatenbereiches und Zoom > 14 dann getCoords
	if ((parseFloat(newLefttop.lat) >= parseFloat(latLeftTopPlus) || parseFloat(newLefttop.lng) <= parseFloat(lonLeftTopPlus) || parseFloat(newRightbottom.lat) <= parseFloat(latRightBtmPlus) || parseFloat(newRightbottom.lng) >= parseFloat(lonRightBtmPlus)) && map.getZoom() > 14){
		map.removeLayer(stationPois);
		stationPois.clearLayers();
		getCoords();
		console.log("mooveEND -> getCoords");
		//console.log(map.hasLayer(subwayLines));
		//console.log(map.hasLayer(sRailLines));
	// Wenn Zoom <= 14 und stationpois vorhanden dann lösche stationpois
	};
	if ((parseFloat(newLefttop.lat) >= parseFloat(latLeftTopPlusR) || parseFloat(newLefttop.lng) <= parseFloat(lonLeftTopPlusR) || parseFloat(newRightbottom.lat) <= parseFloat(latRightBtmPlusR) || parseFloat(newRightbottom.lng) >= parseFloat(lonRightBtmPlusR)) && map.getZoom() > 11){
		console.log("mooveend map > 11")
		if (typeof sRailLines != 'undefined'){
			jsonLayers.clearLayers();
  			getSRailCoords();
		}else if (typeof subwayLines != 'undefined'){
			jsonLayers.clearLayers();
  			getURailCoords();
		}else if (typeof tramLines != 'undefined'){
			jsonLayers.clearLayers();
  			getTramCoords();
		}else {
			getURailCoords();
		}
	};
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
		console.log("zoom <= 14 & stationPois  --> removeLayer stationPois")
		//stationPois.clearLayers();
	}	// Wenn Zoom > 14 und noch keine stationpois vorhanden, führe getCoords aus, -->> Instabil?
	if (map.getZoom() > 14 && !(map.hasLayer(stationPois)) && !(map.hasLayer(indoorLayer))){
		map.addLayer(stationPois);
		//stationPois.clearLayers();
		//getCoords();
		console.log("Zoom > 14 & keine StationPois & keine IndoorDaten --> addLayer stationPois");
		//console.log(stationPois);
	}
	if (map.getZoom() < 17 && map.hasLayer(indoorLayer)){
		console.log("Zoom < 17 & IndooLayer --> remove indoorLayer; addLayer stationPois");
		map.removeLayer(indoorLayer);
		map.removeControl(levelControl);
		//removeHighWays();
		map.removeLayer(highWaysPreceding);
		map.removeLayer(highWaysFollowing);
		//map.removeLayer(highWaysIni);
		//Transparenz zurücksetzen
		osmMap.setOpacity(1);
		mapboxMap.setOpacity(1);
		map.addLayer(stationPois);
		//map.removeLayer(stationPois);
		//stationPois.clearLayers();
		//getCoords();
	}if (map.hasLayer(indoorLayer)){
		console.log("indoorLayer aktiv --> removeLayer stationPois");
		map.removeLayer(stationPois);
		//stationPois.clearLayers();
	}if (map.getZoom() <= 10 && map.hasLayer(jsonLayers)){
		map.removeLayer(jsonLayers);
		console.log("Zoom < 10 & subwayLine --> removeLayer subwayLine");
	}if (map.getZoom() > 10 && !(map.hasLayer(jsonLayers))){
		map.addLayer(jsonLayers);
		console.log("Zoom >= 10 addLayer subwayLine");
	}
});

/*function removeHighWays(){
	console.log("REmove HighWays")
	//corLevels.clearLayers();
	//highWays.clearLayers();
	map.removeLayer(corLevels);
	corLevels.clearLayers();
	corLevels.removeLayer(highWays);
	corLevels.removeLayer(highWaysPreceding);
	map.removeLayer(highWays);
	map.removeLayer(highWaysPreceding);
}*/

//ICONs
var metroIcon = L.MakiMarkers.icon({
    icon: "rail-metro",
    color: "#005EBB",
    size: "m"
});

var fast_food = L.icon({
    iconUrl: "assets/src/fast-food-12.svg",
    color: "#660000",
    size: "s"
});

var pharmacy = L.icon({
    iconUrl: "assets/src/pharmacy-12.svg",
    color: "#660000",
    size: "s"
});

var entrance = L.icon({
    iconUrl: "assets/src/entrance-12.svg",
    color: "#FFFF00",
    size: "s"
});

var posMarker = L.MakiMarkers.icon({
    icon: "marker-stroked",
    color: "#f0f8ff"
});

var wheelchair = L.icon({
    iconUrl: "assets/src/disability-12.svg",
    //color: "#A6FF0D"
});

//	<!-- Geocoder Schaltfläche: Für Suchen-Funktion. Möglichkeit in Klammer: collapsed: false, position: 'bottomright',text: 'Find!', ->
var osmGeocoder = new L.Control.OSMGeocoder(); map.addControl(osmGeocoder);