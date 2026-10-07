/**
 * Module for fetching, filtering, and manipulating USGS Earthquakes data.
 */

// D3 may come in handy for things like binning or scaling.
import * as d3 from 'd3';

// URL for the USGS all earthquakes in the past 7 days GeoJSON feed
const DATA_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

/**
 * Fetches the USGS earthquake GeoJSON feed for the past 7 days.
 *
 * @returns {Promise<Array<Object>>} Array of GeoJSON feature objects.
 */
async function fetchEarthquakes() {
  const data = await d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');
  return data.features;
}

/**
 * Filters an array of earthquake features based on magnitude and depth constraints.
 *
 * @param {Array<Object>} earthquakes Array of GeoJSON feature objects.
 * @param {Object} filters Filter parameters.
 * @param {number} filters.minMag Minimum magnitude (inclusive).
 * @param {number} filters.minDepth Minimum depth in km (inclusive).
 * @param {number} filters.maxDepth Maximum depth in km (inclusive).
 * @returns {Array<Object>} Filtered array of earthquake features.
 */
function filterEarthquakes(earthquakes, filters = {}) {
  return earthquakes.filter((eq) =>{
    const mag = eq.properties.mag;
    const depth = eq.geometry.coordinates[2];
    return(
      mag >= filters.minMag
      && depth
      && coordinates // literally didnt catch what he did here
    )
  })
}

/**
 * Bins earthquakes by magnitude and depth to prepare data for a heatmap scatter plot.
 * Groups features into discrete bins and calculates the earthquake count in each bin.
 *
 * @param {Array<Object>} earthquakes Array of GeoJSON feature objects.
 * @param {number} [magBinCount=10] Number of magnitude bins.
 * @param {number} [depthBinCount=10] Number of depth bins in km.
 * @returns {{ depths: Array<number>, magnitudes: Array<number>, counts: Array<number>, maxCount: number }}
 */
function binEarthquakes(earthquakes, magBinCount = 10, depthBinCount = 10) {
  const depths = [];
  const magnitudes = [];
  const counts = [];

  const depthRange = d3.extent(earthquakes, (eq) => eq.geometry.coordinates[2]);
  const magRange = d3.extent(earthquakes, (eq) => eq.properties.mag);

  const [minDepth, maxDepth] = magRange;
  const [minMag, maxMag] = magRange;

  const magThresholds = [];
  const depthThresholds = [];
  const magbinSize = (maxMag - minMag) / magBinCount;
  const depthbinSize = (maxDepth - minDepth) / depthBinCount;
  for (let m = 0; m < magBinCount; m++){
    magThresholds.push(m*magBinSize);
  }
  for (let d= 0; d< depthBinCount; d++){
    depthThresholds.push(d*depthbinSize);
  }
  for (const eq of earthquakes){
    const mag = eq.properties.mag;
    const depth = eq.geometry.coordinates[2];

    // not sure
  }
}

export {
  fetchEarthquakes,
  filterEarthquakes,
  binEarthquakes,
};
