const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/* // CALCULATE DISTANCE HELPER FUNCTION
function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles

  const toRadians = (deg) => deg * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
} */

// Test endpoint
app.get("/stations", async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLon = parseFloat(req.query.lon);
    let radiusMiles = parseFloat(req.query.radius) || 50;

    if (isNaN(userLat) || isNaN(userLon)) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    const radius = radiusMiles * 1609.34;
    const rbUrl = `https://de2.api.radio-browser.info/json/stations/search?geo_lat=${userLat}&geo_long=${userLon}&geo_distance=${radius}`;
    
    const response = await fetch(rbUrl, {
      headers: {
        "User-Agent": "radio-browser-web/0.1"
      }
    });

    const data = await response.json();

    data.sort((a, b) => a.geo_distance - b.geo_distance);

    /* const geoStations = data.filter(
      (station) => station.geo_lat !== null && station.geo_long !== null
    );

    console.log(
      `Stations total: ${data.length}, with geo: ${geoStations.length}`
    );

    const nearbyStations = geoStations
      .map((station) => {
        const distance = calculateDistanceMiles(
          userLat,
          userLon,
          station.geo_lat,
          station.geo_long
        );

        return {
          ...station,
          distance
        };
      })
      .filter((station) => station.distance <= radius);

    nearbyStations.sort((a, b) => a.distance - b.distance);

    // remove duplicates
    const uniqueStationsMap = new Map();

    nearbyStations.forEach((station) => {
      if (!uniqueStationsMap.has(station.stationuuid)) {
        uniqueStationsMap.set(station.stationuuid, station);
      }
    });

    const uniqueNearbyStations = Array.from(uniqueStationsMap.values());

    //console.log("Radio Browser data:", data); */

    const stations = data.map((station) => ({
      name: station.name,
      url: station.url_resolved || station.url,
      favicon: station.favicon,
      genre: station.tags,
      state: station.state,
      country: station.country,
      distanceMiles: station.geo_distance / 1609.34
    }));

    res.json({
      status: "ok",
      stations
    });
  } catch (error) {
    console.error("Error fetching Radio Browser:", error);
    res.status(500).json({ error: "Failed to fetch Radio Browser" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
