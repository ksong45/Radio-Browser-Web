// MAPSTUFF
let map;
let marker;
let radiusCircle;
let stationLayer;

const matchingIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const markerById = new Map();
const listItemById = new Map();

function getStationId(station) {
  return btoa(station.url).replace(/=/g, "");
}

function showListLoading() {
  const list = document.getElementById("stations");
  list.innerHTML = "";

  const li = document.createElement("li");
  li.textContent = "Finding nearby stations…";
  li.style.padding = "12px";
  li.style.color = "#6b7280";
  li.style.fontStyle = "italic";
  li.style.listStyle = "none";

  list.appendChild(li);
}

function showEmptyMessage() {
  const list = document.getElementById("stations");
  list.innerHTML = "";

  const msg = document.createElement("li");
  msg.textContent = "Search to find nearby radio stations";
  msg.style.color = "#6b7280";
  msg.style.fontStyle = "italic";
  msg.style.padding = "12px";

  list.appendChild(msg);
}


function initMap(lat, lon, radiusMiles) {
  if (!map) {
    map = L.map("map").setView([lat, lon], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    stationLayer = L.layerGroup().addTo(map);

    // click empty map → clear selection
    map.on("click", clearSelection);
  }

  if (marker) marker.remove();
  if (radiusCircle) radiusCircle.remove();

  marker = L.marker([lat, lon]).addTo(map);

  radiusCircle = L.circle([lat, lon], {
    radius: radiusMiles * 1609.34,
    color: "#0077ff",
    fillOpacity: 0.15
  }).addTo(map);

  // ✅ ZOOM HERE — once per search
  map.fitBounds(radiusCircle.getBounds(), {
    padding: [40, 40],
    animate: true
  });
}

// MAPSTUFF

let selectedStationId = null;

function clearSelection() {
  selectedStationId = null;
  document
    .querySelectorAll("#stations li")
    .forEach(el => el.classList.remove("active"));
}

const selectedGenres = new Set();

    document.querySelectorAll(".genre-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const genre = chip.dataset.genre;

        if (selectedGenres.has(genre)) {
          selectedGenres.delete(genre);
          chip.classList.remove("active");
        } else {
          selectedGenres.add(genre);
          chip.classList.add("active");
        }
      });
    });

async function loadStations() {
  try {
    showListLoading();
    const lat = parseFloat(document.getElementById("lat").value);
    const lon = parseFloat(document.getElementById("lon").value);
    const radiusInput = document.getElementById("radius").value;
    const radius = parseFloat(radiusInput) || 50;
    
    const genres = Array.from(selectedGenres);
    const genreParam = genres.join(",");

    // MAPSTUFF
    initMap(lat, lon, radius);

    const response = await fetch(
      `http://localhost:3000/stations?lat=${lat}&lon=${lon}&radius=${radius}&genres=${genreParam}`
    );

    const data = await response.json();

    markerById.clear();
    listItemById.clear();
    clearSelection();

    // MAPSTUFF
    stationLayer.clearLayers();

    data.stations.forEach((station) => {
      if (!station.lat || !station.lon) return;

      const icon = station.matchesGenre ? matchingIcon : defaultIcon;

      const stationId = getStationId(station);

      const pin = L.marker([station.lat, station.lon], { icon });

      pin.bindPopup(`
        <strong>${station.name}</strong><br/>
        ${station.state ? station.state + ", " : ""}${station.country}<br/>
        ${station.genre || ""}<br/>
        <a href="${station.url}" target="_blank">Open stream</a>
      `, { closeButton: false });

      markerById.set(stationId, pin);

      // Hover → show info
      pin.on("mouseover", () => {
        pin.openPopup();
      });

      // Mouse out → hide info
      pin.on("mouseout", () => {
        if (selectedStationId !== stationId) {
          pin.closePopup();
        }
      });

      // Click → selection behavior (keep your existing logic)
      pin.on("click", () => {
        if (selectedStationId === stationId) {
          clearSelection();
          pin.closePopup();
          return;
        }

        clearSelection();
        selectedStationId = stationId;

        const li = listItemById.get(stationId);
        if (!li) return;

        li.classList.add("active");
        li.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      stationLayer.addLayer(pin);
    });
    // END MAPSTUFF

    const list = document.getElementById("stations");
    list.innerHTML = "";

    // ADDED
    const matching = [];
    const others = [];

    data.stations.forEach((station) => {
      if (station.matchesGenre) {
        matching.push(station);
      } else {
        others.push(station);
      }
    });

    const hasGenres = genres.length > 0;

    if (!hasGenres) {
      const header = document.createElement("li");
      header.className = "section-header";
      header.textContent = "NEARBY STATIONS";
      header.style.fontWeight = "bold";
      header.style.marginTop = "12px";
      list.appendChild(header);

      if (others.length > 0) {
        others.forEach(renderStation);
      } else {
        const msg = document.createElement("li");
        msg.textContent = "No nearby stations";
        msg.style.fontStyle = "italic";
        list.appendChild(msg);
      }
    }

    if (hasGenres) {
      const header = document.createElement("li");
      header.className = "section-header";
      header.textContent = "MATCHING GENRES";
      header.style.fontWeight = "bold";
      header.style.marginTop = "12px";
      list.appendChild(header);

      if (matching.length > 0) {
        matching.forEach(renderStation);
      } else {
        const msg = document.createElement("li");
        msg.textContent = "No stations found for selected genres";
        msg.style.fontStyle = "italic";
        list.appendChild(msg);
      }

      const otherHeader = document.createElement("li");
      otherHeader.className = "section-header";
      otherHeader.textContent = "OTHER NEARBY STATIONS";
      otherHeader.style.fontWeight = "bold";
      otherHeader.style.marginTop = "12px";
      list.appendChild(otherHeader);

      if (others.length > 0) {
        others.forEach(renderStation);
      } else {
        const msg = document.createElement("li");
        msg.textContent = "No other nearby stations";
        msg.style.fontStyle = "italic";
        list.appendChild(msg);
      }
    }
  } catch (error) {
    console.error("Error fetching stations:", error);
  }
}

function useLiveLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // MAPSTUFF
      initMap(
        lat,
        lon,
        parseFloat(document.getElementById("radius").value) || 50
      );

      // Fill inputs so user can see values
      document.getElementById("lat").value = lat;
      document.getElementById("lon").value = lon;
    },
    (error) => {
      alert("Unable to retrieve your location");
      console.error(error);
    }
  );
}

function renderStation(station) {
  const list = document.getElementById("stations");
  const li = document.createElement("li");

  const stationId = getStationId(station);
  li.dataset.stationId = stationId;
  listItemById.set(stationId, li);

  /* ---------- List → Map interaction ---------- */
  li.addEventListener("click", () => {
    if (selectedStationId === stationId) {
      clearSelection();
      return;
    }

    clearSelection();
    selectedStationId = stationId;
    li.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });

    const pin = markerById.get(stationId);
    if (pin) {
      pin.openPopup();
      map.panTo(pin.getLatLng(), { animate: true });
    }
  });

  /* ---------- Row layout ---------- */
  li.style.display = "flex";
  li.style.alignItems = "center";
  li.style.justifyContent = "space-between";
  li.style.padding = "10px 6px";
  li.style.cursor = "pointer";

  /* ---------- Left side ---------- */
  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.gap = "10px";

  /* ---------- Favicon ---------- */
  const img = document.createElement("img");
  img.src = station.favicon || "default_radio.png";
  img.onerror = () => (img.src = "default_radio.png");

  img.style.width = "32px";
  img.style.height = "32px";
  img.style.objectFit = "contain";
  img.style.borderRadius = "6px";
  img.style.background = "#eee";

  left.appendChild(img);

  /* ---------- Text stack ---------- */
  const text = document.createElement("div");
  text.style.display = "flex";
  text.style.flexDirection = "column";
  text.style.gap = "2px";

  /* ---------- Station name (ONLY clickable link) ---------- */
  const name = document.createElement("a");
  name.textContent = station.name;
  name.href = station.url;
  name.target = "_blank";

  name.style.fontSize = "0.95rem";
  name.style.fontWeight = "600";
  name.style.color = "#111827";
  name.style.textDecoration = "none";
  name.style.cursor = "pointer";

  name.addEventListener("mouseenter", () => {
    name.style.textDecoration = "underline";
  });

  name.addEventListener("mouseleave", () => {
    name.style.textDecoration = "none";
  });

  // 🔑 prevent map interaction
  name.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  /* ---------- Meta ---------- */
  const meta = document.createElement("div");
  meta.style.fontSize = "0.75rem";
  meta.style.color = "#6b7280";

  const location = station.state
    ? `${station.state}, ${station.country}`
    : station.country;

  meta.textContent = `${location}`;

  text.appendChild(name);
  text.appendChild(meta);
  left.appendChild(text);

  /* ---------- Distance (RIGHT SIDE) ---------- */
  const distance = document.createElement("div");
  distance.className = "station-distance";
  distance.textContent = `${station.distanceMiles.toFixed(1)} mi`;
  distance.style.fontSize = "0.9rem";
  distance.style.fontWeight = "600";
  distance.style.color = "#374151";
  distance.style.whiteSpace = "nowrap";

  li.appendChild(left);
  li.appendChild(distance);
  list.appendChild(li);
}


document.addEventListener("DOMContentLoaded", () => {
  const lat = parseFloat(document.getElementById("lat").value);
  const lon = parseFloat(document.getElementById("lon").value);
  const radius = parseFloat(document.getElementById("radius").value) || 50;

  initMap(lat, lon, radius);
});

showEmptyMessage();

document.getElementById("search").addEventListener("click", loadStations);
document
  .getElementById("live-location")
  .addEventListener("click", useLiveLocation);

  