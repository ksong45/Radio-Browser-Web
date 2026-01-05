const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// HELPER
function stationMatchesGenre(station, genreKey, buckets) {
  if (!genreKey) return false;

  const tags = (station.tags || "").toLowerCase();
  const subterms = buckets[genreKey];

  if (!subterms) return false;

  return subterms.some(term => tags.includes(term));
}

// Test endpoint
app.get("/stations", async (req, res) => {
  try {
    const GENRE_BUCKETS = {
      jazz: [
        "jazz",
        "smooth jazz",
        "cool jazz",
        "bebop",
        "big band",
        "fusion",
        "nu-jazz",
        "latin jazz"
      ],

      rock: [
        "rock",
        "classic rock",
        "hard rock",
        "alternative",
        "metal",
        "punk",
        "indie rock",
        "progressive rock"
      ],

      pop: [
        "pop",
        "top 40",
        "hot adult contemporary",
        "hot ac",
        "adult contemporary",
        "hits"
      ],

      hiphop: [
        "hip hop",
        "hip-hop",
        "rap",
        "r&b",
        "trap"
      ],

      electronic: [
        "electronic",
        "house",
        "deep house",
        "techno",
        "trance",
        "ambient",
        "edm"
      ],

      classical: [
        "classical",
        "orchestral",
        "symphony",
        "opera",
        "baroque",
        "chamber"
      ],

      country: [
        "country",
        "classic country",
        "new country",
        "americana",
        "bluegrass"
      ],

      oldies: [
        "oldies",
        "50s",
        "60s",
        "70s",
        "80s",
        "90s",
        "classic hits"
      ],

      reggae: [
        "reggae",
        "dancehall",
        "ska",
        "soca",
        "calypso"
      ],

      talk: [
        "talk",
        "news",
        "public radio",
        "npr"
      ]
    };

    const userLat = parseFloat(req.query.lat);
    const userLon = parseFloat(req.query.lon);
    let radiusMiles = parseFloat(req.query.radius) || 50;
    const genre = req.query.genre || "";

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

    const streamMap = new Map();

    data.forEach((station) => {
      const streamKey = station.url_resolved || station.url;
      if (!streamKey) return;

      if (!streamMap.has(streamKey)) {
        streamMap.set(streamKey, station);
      } else {
        const existing = streamMap.get(streamKey);

        // Keep the better entry
        if ((station.votes || 0) > (existing.votes || 0)) {
          streamMap.set(streamKey, station);
        }
      }
    });

    const uniqueStations = Array.from(streamMap.values());

    // data.sort((a, b) => a.geo_distance - b.geo_distance);

    // genre
    let matching = [];
    let nonMatching = [];

    uniqueStations.forEach((station) => {
      if (stationMatchesGenre(station, genre, GENRE_BUCKETS)) {
        matching.push(station);
      } else {
        nonMatching.push(station);
      }
    });

    matching.sort((a, b) => a.geo_distance - b.geo_distance);
    nonMatching.sort((a, b) => a.geo_distance - b.geo_distance);

    const orderedStations = genre
      ? [...matching, ...nonMatching]
      : [...uniqueStations].sort(
          (a, b) => a.geo_distance - b.geo_distance
        );
    /* console.log("Stations sent to frontend (FULL OBJECTS):");

    uniqueStations.forEach((station, i) => {
      console.log(`\n--- Station ${i + 1} ---`);
      console.log(station);
    }); */

    const stations = orderedStations.map((station) => ({
      name: station.name,
      url: station.url_resolved || station.url,
      favicon: station.favicon,
      genre: station.tags,
      state: station.state,
      country: station.country,
      distanceMiles: station.geo_distance / 1609.34,
      // ADDED
      matchesGenre: genre
          ? stationMatchesGenre(station, genre, GENRE_BUCKETS)
          : false
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
