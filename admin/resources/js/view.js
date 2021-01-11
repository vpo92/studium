var map = L.map('map').setView([48.8534, 2.3488], 11);
//var marker = [];
//var markerClusters = L.markerClusterGroup();

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


for(var i = 0; i < globalOpusList.length; i++){
    var m  = globalOpusList[i];
    L.marker([m.x, m.y]).addTo(map)
        .bindPopup(m.Ville)
        .openPopup();

    /**
    var marker = L.marker([m.x, m.y]); // pas de addTo(macarte), l'affichage sera géré par la bibliothèque des clusters
    marker.bindPopup(m.Ville);
    //markerClusters.addLayer(marker); // Nous ajoutons le marqueur aux groupes
    markers.push(marker); // Nous ajoutons le marqueur à la liste des marqueurs
     */
}

//var group = new L.featureGroup(markers);
//map.fitBounds(group.getBounds().pad(0.5));
//map.addLayer(markerClusters);


//var group = new L.featureGroup(markers);
//map.fitBounds(group.getBounds().pad(0.5));


