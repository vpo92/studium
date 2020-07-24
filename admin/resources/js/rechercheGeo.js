var circleStyle = function(point, item) {
    return {
        id: point,
        listText: item
    };
};

var clickAction = function(eid) {
    alert("element " + eid + " clicked");
};

var options = {
    labelFn: function(el, ei, cluster) {
        return (
            '<p style="cursor: pointer" onclick="clickAction(' +
            el.options.id +
            ')">[' +
            ei +
            "] " +
            el.options.listText +
            "</p>"
        );
    },
    headerFn: function(els, cluster) {
        return "<p> " + els.length + " elements</p>";
    },
    sortFn: function(m1, m2) {
        return m1.options.id > m2.options.id ? 1 : -1;
    },
    showHeader: true,
    sidePanel: false,
    sidePanelWidth: "200px",
    centerOnChange: true,
    showCoverageOnHover: false
};

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
            var markers = L.markerClusterGroup.withList(options);
            this.results.forEach( async function (item) {
                const aux = await fetch(`${apiUrl}/carto/ville/${item["Places"]}`, {
                    'method': 'GET',
                    'headers': {
                        'Content-Type': 'application/json',
                    },
                });

                this.resultVille = await aux.json();

                let style = circleStyle(item._id, item['cote']);
                var marker = L.markerClusterGroup.listMarker([this.resultVille["YWGS84"], this.resultVille["XWGS84"]], style);
                markers.addLayer(marker);

            });

            markers.on("click", function(m) {
                clickAction(m.layer.options.id);
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

        L.control
            .zoom({
                position: "bottomleft"
            })
            .addTo(myMap);

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

