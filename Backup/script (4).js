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
	var 	map = L.map('map', {	layers: [osmMap]	}).setView([48.13925, 11.56536], 17);

//	3.)	<!-- Hier werden LAyer definiert- die in der Layer übersicht erschienen ->
	var 	baseLayers = {
			"OSM Mapnik": osmMap,
			"Mapbox streets": mapboxMap
			};

//	<!-- Layerschaltflächen für Kartendienste -->
	L.control.layers(baseLayers).addTo(map); 
		

/*
* Daten über Overpass API abfragen und in GEOJSON Daten transformieren
*	1. Koordinaten werden abgegriffen für die Overpass API Abfrage
*	2. Abfrage in eine Variable schreiben
*	3. mit JQuery $ werden die Daten bezogen und mittels 'osm2geojson' umgewandelt, gestylt
*/

//	1.) Koordinaten werden abgegriffen für die Overpass API Abfrage
function getCoords(){
	var 	coords = map.getBounds();				//Koordinaten BBOX abgreifen
	var		lefttop = coords.getNorthWest();		//Koordinaten splitten linksoben
	var		rightbottom = coords.getSouthEast();	//Koordinaten splitten rechtsunten
	
	getGeojson(lefttop.lat,lefttop.lng,rightbottom.lat,rightbottom.lng);
}

//	2.)	<!-- Hier kommt die Abfrage für die Overpass-api in eine Variable-->
function getGeojson(leftlat,leftlng,rightlat,rightlng){
    var 	query = '<query type="node"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><print/><union><query type="way"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="way-node"/></union><print/><union><query type="relation"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/>';
//IF-Abfrage damit DAten nicht bei kleinem MAßstab geladen werden -> Performance
    if (map.getZoom()>16){
//	3.) Daten mit JQuery abgreifen und in geojson transformieren, stylen
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
					"area": true,
					"public_transport": true,
					"area:highway": true
				}
			});

			var markers = new L.geoJson(geoJSON, {
	// Poppup mit Inhalt definieren --> Es muss noch eine FUnktion herum, die prüft ob Name, description vorhanden; Öffnungszeiten, Kosten...
				onEachFeature: function(feature, layer) {
					layer.bindPopup('<b>' + feature.properties.tags.name + '</b><br>' + '<br \/>' + feature.properties.tags.description + '<\/p>');
				},
	// Aussehen der GeoJson Daten definieren
                style: function(feature) {
                    return {

                        weight: 2,			//Rahmendicke
                        color: '#fff800',	//Rahmenfarbe
                        fillOpacity: 0.8
                    };
                }
            });
				
            markers.setLevel("0");

            markers.addTo(map);

            var levelControl = new L.Control.Level({
                level: "0",
                levels: markers.getLevels()
            });

            // Connect the level control to the indoor layer
            levelControl.addEventListener("levelchange", markers.setLevel, markers);

            levelControl.addTo(map);
        });
}}

getCoords();
map.on('moveend', function(){getCoords();});
//	<!-- Geocoder Schaltfläche anlegen. Möglichkeit in Klammer: collapsed: false, position: 'bottomright',text: 'Find!', ->	
	var osmGeocoder = new L.Control.OSMGeocoder(); map.addControl(osmGeocoder);