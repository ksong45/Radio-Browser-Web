# Radio Browser Web

> An interactive web app for discovering nearby radio stations by location and genre.

Radio Browser Web is a lightweight, end-to-end system that helps users explore local radio stations anywhere in the world.  
It combines geolocation, map-based visualization, and real-time filtering to make radio discovery intuitive and visual.

Live Demo: https://radio-browser-web-two.vercel.app/
This app is hosted on a lightweight free-tier service. The first request after inactivity may take a few seconds while the server “wakes up.” Subsequent interactions should be fast.

## Demo
<p align="center">
  <img src="assets/landing.png" width="70%" />
  <br/>
  <em>Landing view — enter coordinates or use live location to begin discovering nearby radio stations.</em>
</p>
<p align="center">
  <img src="assets/default_find.png" width="70%" />
  <br/>
  <em>Default results view — nearby stations are listed and mapped after a search, showing distance and location context.</em>
</p>
<p align="center">
  <img src="assets/genre_filter.png" width="70%" />
  <br/>
  <em>Optional genre filtering — toggle one or more genres to surface stations that match your taste.</em>
</p>
<p align="center">
  <img src="assets/maplist.png" width="70%" />
  <br/>
  <em>Synchronized map and list — selecting a station highlights it and pans the map for spatial context.</em>
</p>

## Features
- Location-based discovery using latitude/longitude or live browser geolocation  
- Radius-controlled search to explore stations within any geographic range  
- Interactive map with real-time markers for nearby stations  
- Synchronized list and map views for intuitive spatial browsing  
- One-click genre filtering with fast, toggleable chips  
- Smart grouping of results into “Matching” and “Other Nearby Stations”  
- Distance-aware sorting so closer stations surface first  
- Clean, app-style interface optimized for exploration  
- Direct links to live station streams

## Tech Stack
- Frontend: HTML, CSS, JavaScript  
- Mapping: Leaflet.js (interactive map + markers)  
- Backend: Node.js, Express  
- APIs: Radio Browser API (station discovery and metadata)  
- Browser APIs: Geolocation API (live location lookup)  
- Data Processing: Server-side deduplication, distance sorting, and genre bucketing  
- Hosting: Local Node server + static frontend (easily deployable to GitHub Pages / Render / Railway)

## How It Works
1. The user enters a latitude/longitude and radius, or clicks “Use Current Location” to populate coordinates via the browser’s Geolocation API.
2. The client initializes a Leaflet map, placing a center marker and drawing a radius circle to visualize the search area.
3. When “Find” is clicked, the frontend sends a request with location and selected genres to the backend endpoint.
4. The backend queries the Radio Browser API, deduplicates stations, computes distances, and applies genre buckets to classify matches.
5. Results are returned in distance order and rendered in two synchronized views:
   - A list panel with station name, location, and distance
   - An interactive map with color-coded markers
6. Clicking a station in the list pans and highlights its marker; clicking a marker scrolls and highlights its list entry.
7. Genre filters dynamically partition results into “Matching” and “Other Nearby Stations” for fast exploration.

## Getting Started

You can either try the live demo (once deployed) or run the project locally.

### Prerequisites
- Node.js (v18+ recommended)
- A modern web browser (Chrome, Edge, Firefox)

### Installation
```bash
git clone https://github.com/ksong45/Radio-Browser-Web.git
cd Radio-Browser-Web
npm install
```

### Running the App
```bash
# Start the backend server
node server.js
```

Then open `index.html` in your browser.

The app will:
- Load the frontend locally in your browser  
- Send requests to `http://localhost:3000/stations`  
- Fetch nearby radio stations and render them on the map and in the list

## Configuration
This project currently does not require any environment variables.

All data is fetched from the public Radio Browser API, and the backend runs locally on port `3000` by default. The system is intentionally lightweight and easy to run out of the box.

## Roadmap
- Deploy the app publicly (GitHub Pages + hosted backend)
- Add audio playback directly in the browser
- Persist user preferences (last location, favorite genres)
- Improve mobile layout and touch interactions
- Add station previews and richer metadata
- Cache recent results to reduce API calls
- Expand radio database size

## Credits
- [Radio Browser](https://www.radio-browser.info/) — open API for global radio station data  
- [Leaflet.js](https://leafletjs.com/) — interactive mapping library  
- [OpenStreetMap](https://www.openstreetmap.org/) — map tiles  
- Marker icons by [pointhi/leaflet-color-markers](https://github.com/pointhi/leaflet-color-markers)  
- Default radio icon from VeryIcon: https://www.veryicon.com/icons/miscellaneous/foundation-filling/radio-141.html?p=5
