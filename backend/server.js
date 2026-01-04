const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DISTANCE_THRESHOLD = 50;

// CALCULATE DISTANCE HELPER FUNCTION
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
}

// Test endpoint
app.get("/stations", async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLon = parseFloat(req.query.lon);

    if (isNaN(userLat) || isNaN(userLon)) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    const rbUrl = "https://de2.api.radio-browser.info/json/stations/topclick/1000";

    const response = await fetch(rbUrl, {
      headers: {
        "User-Agent": "radio-browser-web/0.1"
      }
    });

    const data = await response.json();

    const geoStations = data.filter(
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
      .filter((station) => station.distance <= DISTANCE_THRESHOLD);

    nearbyStations.sort((a, b) => a.distance - b.distance);

    //console.log("Radio Browser data:", data);

    const stations = nearbyStations.map((station) => ({
      name: station.name,
      url: station.url_resolved || station.url,
      favicon: station.favicon,
      genre: station.tags,
      state: station.state,
      country: station.country,
      distance: station.distance
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
