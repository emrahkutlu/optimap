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
	var 	map = L.map('map', {	layers: [osmMap]	}).setView([48.13925, 11.56536], 17);
//		<!-- Hier werden LAyer definiert- die in der Layer übersicht erschienen ->
		var baseLayers = {
			"OSM Mapnik": osmMap,
			"Mapbox streets": mapboxMap
			};
		L.control.layers(baseLayers).addTo(map); <!-- Layerschaltflächen -->
		


	var 	coords = map.getBounds();			//Koordinaten BBOX abgreifen
	var		lefttop = coords.getNorthWest();	//Koordinaten splitten linksoben
	var		rightbottom = coords.getSouthEast();//Koordinaten splitten rechtsunten

  /* Load points GeoJSON and add to map */
//	<!-- Hier kommt die Abfrage für die Overpass-api in eine Variable-->
    var query = 	'<query type="node"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightbottom.lat+'" n="'+lefttop.lat+'" w="'+lefttop.lng+'" e="'+rightbottom.lng+'"/></query><print/><union><query type="way"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightbottom.lat+'" n="'+lefttop.lat+'" w="'+lefttop.lng+'" e="'+rightbottom.lng+'"/></query><recurse type="way-node"/></union><print/><union><query type="relation"><has-kv k="layer" modv="" v=""/><bbox-query s="'+rightbottom.lat+'" n="'+lefttop.lat+'" w="'+lefttop.lng+'" e="'+rightbottom.lng+'"/></query><recurse type="down"/></union><print/>';


	$.get("http://overpass-api.de/api/interpreter?data=" + query, function(data) {
			var geoJSON = osmtogeojson(data, {
				polygonFeatures: {
					area: true
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

                    if (feature.properties.tags.area === 'yes') {
                        fill = '#169EC6';
                    } else if (feature.properties.tags.shop === 'clothes') {
                        fill = '#0A485B';
                    }

                    return {
                        fillColor: fill,
                        weight: 1,
                        color: '#fff800',
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