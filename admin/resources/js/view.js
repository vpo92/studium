if(globalOpusList!=null && globalOpusList.length > 0){

  var map = L.map('map').setView([47.4700, 6.8116], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var latLngs = [];

    for(var i = 0; i < globalOpusList.length; i++){

        var m  = globalOpusList[i];
        console.log(m);
        var mar = L.marker([m.x, m.y]);
        mar.addTo(map)
            .bindPopup(m.Ville)
            .openPopup();
        latLngs.push(mar.getLatLng());

    }

    var markerBounds = L.latLngBounds(latLngs);
    map.fitBounds(markerBounds);
}else{
  document.getElementById("visuGeo").style.display = 'none';
}
