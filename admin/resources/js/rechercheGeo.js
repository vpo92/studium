new Vue({
    el : "#map",
    data : {
        results : null,
        resultVille: null,

    },
    methods : {
        findManuscrits : async function () {


            //fetch markers
            const result = await fetch(`${apiUrl}/carto/manuscrits`, {
                'method': 'GET',
                'headers': {
                    'Content-Type': 'application/json',
                },
            });

            this.results = await result.json();


        },
        addMarkers : function (map) {

            console.log("add markers");
            var markers = L.markerClusterGroup();
            this.results.forEach( async function (item) {
                    const aux = await fetch(`${apiUrl}/carto/ville/${item["Places"]}`, {
                        'method': 'GET',
                        'headers': {
                            'Content-Type': 'application/json',
                        },
                    });

                    this.resultVille = await aux.json();


                var marker = L.marker([this.resultVille["YWGS84"], this.resultVille["XWGS84"]]);
                marker.bindPopup(item["cote"]);
                markers.addLayer(marker);

            });
            map.addLayer(markers);

        }

    },
    mounted : function () {

        /*var myMap = L.map('myMap').setView([48, 12], 4);

        myMap.invalidateSize(true);

        L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            attribution: 'donn&eacute;es &copy; <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
            minZoom: 1,
            maxZoom: 20
        }).addTo(myMap);

        this.findManuscrits().then( () => {
            this.addMarkers(myMap);
        });*/

    },
   /* onMapReady : function(map: L.Map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 0);
    }*/
})

