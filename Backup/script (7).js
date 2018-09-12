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
	var 	map = L.map('map', {	layers: [osmMap]	}).setView([48.13925, 11.56536], 15);

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
	getGeojsonPoi(lefttop.lat,lefttop.lng,rightbottom.lat,rightbottom.lng);
	};

//	5.)	<!-- Hier kommt die Abfrage für die Overpass-api in eine Variable-->
function getGeojsonPoi(leftlat,leftlng,rightlat,rightlng){
    var 	query = '<query type="node"><has-kv k="railway" modv="" v="station"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><print/><union><query type="way"><has-kv k="railway" modv="" v="station"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="way-node"/></union><print/><union><query type="relation"><has-kv k="railway" modv="" v="station"/><bbox-query s="'+rightlat+'" n="'+leftlat+'" w="'+leftlng+'" e="'+rightlng+'"/></query><recurse type="down"/></union><print/>';
//	6.) Daten mit JQuery abgreifen und in geojson transformieren, stylen
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data) {
			var geoJson = osmtogeojson(data);
				var stationPois = new L.geoJson(geoJson, {
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
	})

	// Bei Klick zum POI zoomen und zentrieren
	 function onClick(selPoi){
	 	map.setView(selPoi.latlng, 18);
	 	getGeojsonData(leftlat,leftlng,rightlat,rightlng);
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
					"area": true,
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
	// Poppup mit Inhalt definieren --> Es muss noch eine FUnktion herum, die prüft ob Name, description vorhanden; Öffnungszeiten, Kosten...
				onEachFeature: function(feature, layer) {
					layer.bindPopup('<b>' + feature.properties.tags.name + '</b><br>' + '<br \/>' + feature.properties.tags.description + '<\/p>');
				},
	// Aussehen der GeoJson Daten definieren
                style: function(feature) {
                    var fill ;

                    if (feature.properties.tags.shop === 'food') {
                        fill = '#99FF00';
                    } 
                    else if (feature.properties.tags.shop) {
                        fill = '#069610';
                    } 
                    if (feature.properties.tags.public_transport === 'platform') {
                        fill = '#fff800';
                    }
                    if (feature.properties.tags.tunnel === 'yes') {
                        fill = '#A3B9C2';
                    } 
                    if (feature.properties.tags.shop) {
						fill = '#069610';
					}

                    return {
                        fillColor: fill,
                        weight: 2,			//Rahmendicke
                        color: '#fff800',	//Rahmenfarbe
                        fillOpacity: 0.8
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

};

getCoords();
map.on('moveend', function(){getCoords();});
//	<!-- Geocoder Schaltfläche anlegen. Möglichkeit in Klammer: collapsed: false, position: 'bottomright',text: 'Find!', ->	
	var osmGeocoder = new L.Control.OSMGeocoder(); map.addControl(osmGeocoder);