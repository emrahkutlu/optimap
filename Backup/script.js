//<!-- Variablen mit dem Inhalt Links-->
	var osmLink = '<a href = "http://openstreetmap.org">OpenStreetMap</a>',
		mapboxLink = '<a href = "http://mapbox.com">Mapbox</a>';

//	<!-- Variablen für Kartenlinks und Quellangabe-->
	var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		osmAttrib =  '&copy; ' + osmLink + ' Contributors',
		
		mapboxUrl = 'https://a.tiles.mapbox.com/v3/rotkelch.ib6amnh3/{z}/{x}/{y}.png',
		mapboxAttrib = 'Map data &copy; <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';

//	<!-- Variablen mit Kartenlinks plus Prameter (Quellangabe, maxZoom...)-->
	var 	osmMap = L.tileLayer(osmUrl, {attribution: osmAttrib, maxZoom: 20})
			mapboxMap = L.tileLayer(mapboxUrl, {attribution: mapboxAttrib});
			
//	<!-- Kartencontainer wird mit einer Karte belegt und Ausschnitt, Zoomlevel bestimmt-->
	var 	map = L.map('map', {	layers: [osmMap]	}).setView([48.13925, 11.56536], 18);
//		<!-- Hier werden LAyer definiert- die in der Layer übersicht erschienen ->
		var baseLayers = {
			"OSM Mapnik": osmMap,
			"Mapbox streets": mapboxMap
			};
		L.control.layers(baseLayers).addTo(map); <!-- Layerschaltflächen -->


  /* Load points GeoJSON and add to map */
//	<!-- Hier kommt die Abfrage für die Overpass-api in eine Variable-->
    var query = '(relation(2016097);>>->.rels;>;);out;';
	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data) {
			var geoJSON = osmtogeojson(data, {
				polygonFeatures: {
					buildingpart: true
				}
			});

			var indoorLayer = new L.Indoor(geoJSON, {
				getLevel: function(feature) { 
					if (feature.properties.relations.length === 0)
						return null;

					return feature.properties.relations[0].reltags.level;
				},
				onEachFeature: function(feature, layer) {
					layer.bindPopup(JSON.stringify(feature.properties, null, 4));
				},
                style: function(feature) {
                    var fill = 'white';

                    if (feature.properties.tags.buildingpart === 'corridor') {
                        fill = '#169EC6';
                    } else if (feature.properties.tags.buildingpart === 'verticalpassage') {
                        fill = '#0A485B';
                    }

                    return {
                        fillColor: fill,
                        weight: 1,
                        color: '#666',
                        fillOpacity: 1
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