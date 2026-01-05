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
    const lat = parseFloat(document.getElementById("lat").value);
    const lon = parseFloat(document.getElementById("lon").value);
    const radiusInput = document.getElementById("radius").value;
    const radius = parseFloat(radiusInput) || 50;
    //const genre = document.getElementById("genre").value;
    const genres = Array.from(selectedGenres);
    const genreParam = genres.join(",");

    const response = await fetch(
      `http://localhost:3000/stations?lat=${lat}&lon=${lon}&radius=${radius}&genres=${genreParam}`
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

    const hasGenres = genres.length > 0;

    if (!hasGenres) {
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

    if (hasGenres) {
      const header = document.createElement("li");
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
    
    /* if (genre === "") {
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
    } */

    /* if (genre) {
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
    } */

    /* if (genre) {
      const header = document.createElement("li");
      header.textContent = `${genre.toUpperCase()} STATIONS`;
      header.style.fontWeight = "bold";
      header.style.marginTop = "12px";
      list.appendChild(header);

      matching.forEach(renderStation);
    } */

    /* if (genre) {
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
    } */

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
      //loadStations();
    },
    (error) => {
      alert("Unable to retrieve your location");
      console.error(error);
    }
  );
}

// ADDED
/* function renderStation(station) {
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
} */

function renderStation(station) {
  const list = document.getElementById("stations");
  const li = document.createElement("li");

  // Make the row horizontal
  li.style.display = "flex";
  li.style.alignItems = "center";
  li.style.gap = "8px";
  li.style.padding = "6px 0";

  // Favicon
  const img = document.createElement("img");
  img.src = station.favicon || "default_radio.png";

  img.onerror = () => {
    img.src = "default_radio.png";
  };

  img.style.width = "28px";
  img.style.height = "28px";
  img.style.objectFit = "contain";
  img.style.borderRadius = "4px";
  img.style.background = "#eee";

  li.appendChild(img);

  // Text container
  const text = document.createElement("span");

  const location = station.state
    ? `(${station.state}, ${station.country})`
    : `(${station.country})`;

  if (station.url) {
    const link = document.createElement("a");
    link.href = station.url;
    link.textContent = station.name;
    link.target = "_blank";
    link.style.fontWeight = "500";
    text.appendChild(link);
  } else {
    text.textContent = station.name;
  }

  text.append(
    ` | ${location} | ${station.distanceMiles.toFixed(2)} miles | ${station.genre}`
  );

  li.appendChild(text);
  list.appendChild(li);
}

document.getElementById("search").addEventListener("click", loadStations);
document
  .getElementById("live-location")
  .addEventListener("click", useLiveLocation);