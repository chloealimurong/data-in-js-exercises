/*

INSTRUCTIONS
============

1.  Update the getPollingPlaces function to get the Philadelphia Polling Places
    GeoJSON data from OpenDataPhilly using the `fetch` function, AND COMBINE
    DUPLICATE POLLING PLACES. Keep a list of unique polling places and the
    precincts that correspond to each place. The data is available at
    https://opendataphilly.org/datasets/polling-places/.

2.  Update the initPollingPlaceLayer function to add a popup to each marker
    that shows the name (`placename`), address (`street_address`), and the list
    of precincts that vote at the polling place.

*/

import 'leaflet';

/* globals L */

/**
 * Creates a polling places Leaflet map object.
 * @param {string|HTMLElement} elementOrId The DOM element where the map will live
 * @returns {L.Map} The constructed Leaflet Map
 */
function initPollingPlaceMap(elementOrId) {
  const map = L.map(elementOrId).setView([39.9526, -75.1652], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}

/**
 * Fetches the polling place data from OpenDataPhilly AND
 * AGGREGATES IT BASED ON UNIQUE STREET ADDRESSES.
 * @returns {Promise<GeoJSON.FeatureCollection>} The deduplicated polling place data.
 */
async function getPollingPlaceData() {
  const pollplace =  await fetch('https://phl.carto.com/api/v2/sql?q=SELECT+*+FROM+polling_places&filename=polling_places&format=geojson&skipfields=cartodb_id');
  const data = await pollplace.json();
  return data;
}

/**
 * Creates a Leaflet GeoJSON layer for polling places and adds it to the map.
 * @param {L.Map} map The Leaflet map where the layer will be added.
 * @returns {Promise<L.GeoJSON>} The constructed Leaflet GeoJSON layer.
 */
async function initPollingPlaceLayer(map) {
  const pollingPlaceData = await getPollingPlaceData();
  window.pollingPlaceData = pollingPlaceData;

  // Create a custom icon for polling places.
  const icon = L.icon({
    iconUrl: 'img/polling-place-marker.png',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, -36],
    shadowUrl: 'img/polling-place-marker-shadow.png',
    shadowSize: [40, 48],
    shadowAnchor: [20, 48],
  });

  const pollingPlaceFeatures = [];
  const seenAddresses = new Set();
  for (const precinct of pollingPlaceData.features){
    // get the street address of polling place on the precinct
    const address = precinct.properties.street_address;
    // check whether the address has been seen before
    const hasSeen = seenAddresses.has(address);
    // const seenAddresses = pollingPlaceFeatures.map((pp) => pp.properties.street_address);
    // const hasSeen = seenAddresses.includes(address); // gonna return true or false
    // if not, add the polling place to the array.
    if (!hasSeen) {
      precinct.properties.precincts = [precinct.properties.precinct]
      pollingPlaceFeatures.push(precinct);
      seenAddresses.add(address);
    }
    // if we have, modify the polling place that exists
    else {
      const pollingPlace = pollingPlaceFeatures.find((pp) => pp.properties.street_address === address);
      pollingPlace.properties.precincts.push(precinct.properties.precinct);
    }

  }

  // Create a GeoJSON layer with the polling place data. Override the default
  // pointToLayer function to construct markers with the custom icon.
  const layer = L.geoJSON(pollingPlaceFeatures, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, { icon: icon });
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`
        <p>${feature.properties.placename}</p>
        <p>${feature.properties.street_address}</p>
        <p>${feature.properties.precincts.join(', ')}</p>        
        `);
    },
  }).addTo(map);

  return layer;
}

window.pollingPlaceMap = initPollingPlaceMap('map');
window.pollingPlaceLayer = await initPollingPlaceLayer(window.pollingPlaceMap);

const locateBtn = document.querySelector('#findNearestPollingPlaceBtn');
locateBtn.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    console.log(pos);
    window.pollingPlaceMap.flyTo([pos.coords.latitude, pos.coords.longitude], 18);
  }, (err) => {
    console.error(err)
  }, {enablehighAccuracy: true});
})
