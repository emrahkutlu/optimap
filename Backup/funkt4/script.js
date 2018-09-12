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
	var 	coords = map.getBounds();				//Koordinaten BBOX abgreifen
	var		lefttop = coords.getNorthWest();		//Koordinaten splitten linksoben
	var		rightbottom = coords.getSouthEast();	//Koordinaten splitten rechtsunten


//	2.)	<!-- Hier kommt die Abfrage für die Overpass-api in eine Variable-->
    var 	query = '<query type="node"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightbottom.lat+'" n="'+lefttop.lat+'" w="'+lefttop.lng+'" e="'+rightbottom.lng+'"/></query><print/><union><query type="way"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightbottom.lat+'" n="'+lefttop.lat+'" w="'+lefttop.lng+'" e="'+rightbottom.lng+'"/></query><recurse type="way-node"/></union><print/><union><query type="relation"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightbottom.lat+'" n="'+lefttop.lat+'" w="'+lefttop.lng+'" e="'+rightbottom.lng+'"/></query><recurse type="down"/></union><print/>';

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
					"area": true,
					"shop": true,
					"public_transport": true,
					"area:highway": true
				}
			});

			var indoorLayer = new L.Indoor(geoJSON, {
				getLevel: function(feature) { 
					if (feature.properties.tags.length === 0)
						return null;

					return feature.properties.tags.layer;
				},
				onEachFeature: function(feature, layer) {
					layer.bindPopup(JSON.stringify(feature.properties, null, 4));
				},
                style: function(feature) {
                    var fill = 'white';

                    if (feature.properties.tags.public_transport === 'platform') {
                        fill = '#fff800';
                    } else if (feature.properties.tags.shop === '') {
                        fill = '#0A485B';
                    } else if (feature.properties.tags.area === 'yes') {
						fill = '#169EC6';
					}

                    return {
                        fillColor: fill,
                        weight: 1,
                        color: '#fff800',
                        fillOpacity: 0.9
                    };
                }
            });

            indoorLayer.setLevel("0");

            indoorLayer.addTo(map);

            var levelControl = new L.Control.Level({
                level: "0",
                levels: indoorLayer.getLevels()
            });

            // Connect the level control to the indoor layer
            levelControl.addEventListener("levelchange", indoorLayer.setLevel, indoorLayer);

            levelControl.addTo(map);
        });

//	<!-- Geocoder Schaltfläche anlegen. Möglichkeit in Klammer: collapsed: false, position: 'bottomright',text: 'Find!', ->	
	var osmGeocoder = new L.Control.OSMGeocoder(); map.addControl(osmGeocoder);