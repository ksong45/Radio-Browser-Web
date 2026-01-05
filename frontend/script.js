async function loadStations() {
  try {
    const lat = parseFloat(document.getElementById("lat").value);
    const lon = parseFloat(document.getElementById("lon").value);
    const radiusInput = document.getElementById("radius").value;
    const radius = parseFloat(radiusInput) || 50;
    const genre = document.getElementById("genre").value;

    const response = await fetch(
      `http://localhost:3000/stations?lat=${lat}&lon=${lon}&radius=${radius}&genre=${genre}`
    );

    const data = await response.json();

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

    if (genre === "") {
      const header = document.createElement("li");
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

    if (genre) {
      const header = document.createElement("li");
      header.textContent = `${genre.toUpperCase()} STATIONS`;
      header.style.fontWeight = "bold";
      header.style.marginTop = "12px";
      list.appendChild(header);

      if (matching.length > 0) {
        matching.forEach(renderStation);
      } else {
        const msg = document.createElement("li");
        msg.textContent = `No ${genre} stations found nearby`;
        msg.style.fontStyle = "italic";
        list.appendChild(msg);
      }
    }

    /* if (genre) {
      const header = document.createElement("li");
      header.textContent = `${genre.toUpperCase()} STATIONS`;
      header.style.fontWeight = "bold";
      header.style.marginTop = "12px";
      list.appendChild(header);

      matching.forEach(renderStation);
    } */

    if (genre) {
      const header = document.createElement("li");
      header.textContent = "OTHER NEARBY STATIONS";
      header.style.fontWeight = "bold";
      header.style.marginTop = "12px";
      list.appendChild(header);

      if (others.length > 0) {
        others.forEach(renderStation);
      } else {
        const msg = document.createElement("li");
        msg.textContent = "No other nearby stations";
        msg.style.fontStyle = "italic";
        list.appendChild(msg);
      }
    }

    /* if (genre) {
      const header = document.createElement("li");
      header.textContent = "OTHER NEARBY STATIONS";
      header.style.fontWeight = "bold";
      header.style.marginTop = "12px";
      list.appendChild(header);

      others.forEach(renderStation);
    } */
    // ADDED

    /* data.stations.forEach((station) => {
      const li = document.createElement("li");

      const location = station.state
        ? `(${station.state}, ${station.country})`
        : `(${station.country})`;

      if (station.url) {
        const link = document.createElement("a");
        link.href = station.url;
        link.textContent = station.name;
        link.target = "_blank"; // open in new tab
        li.appendChild(link);
      } else {
        li.textContent = station.name;
      }

      li.append(` | ${location} | ${station.distanceMiles.toFixed(2)} miles | ${station.genre}`);

      list.appendChild(li);
    }); */
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

      // Fill inputs so user can see values
      document.getElementById("lat").value = lat;
      document.getElementById("lon").value = lon;

      // Reuse existing logic
      loadStations();
    },
    (error) => {
      alert("Unable to retrieve your location");
      console.error(error);
    }
  );
}

// ADDED
function renderStation(station) {
  const list = document.getElementById("stations");
  const li = document.createElement("li");

  const location = station.state
    ? `(${station.state}, ${station.country})`
    : `(${station.country})`;

  if (station.url) {
    const link = document.createElement("a");
    link.href = station.url;
    link.textContent = station.name;
    link.target = "_blank";
    li.appendChild(link);
  } else {
    li.textContent = station.name;
  }

  li.append(
    ` | ${location} | ${station.distanceMiles.toFixed(2)} miles | ${station.genre}`
  );

  list.appendChild(li);
}

document.getElementById("search").addEventListener("click", loadStations);
document
  .getElementById("live-location")
  .addEventListener("click", useLiveLocation);