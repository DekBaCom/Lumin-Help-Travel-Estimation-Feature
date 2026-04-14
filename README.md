# 🚙 Lumin Help - EV Trip Planner

Lumin Help is a smart travel estimation tool designed specifically for **Changan Lumin L** EV owners. The application provides an interactive geographic map allowing users to pinpoint or search their origin and destination to accurately estimate travel viability based on the remaining battery percentage and car model. 

If the battery range is insufficient, the system provides recommendations for EV charging point locations.



---

## ✨ Features

- **Model Specific Calculations**: Choose between `Lumin L AC` (Max Range: 210km) and `Lumin L DC` (Max Range: 301km).
- **Interactive Mapping System**: Powered by [Leaflet.js](https://leafletjs.com/) and OpenStreetMap, users can see the exact points for their journey.
- **Smart Geocoding Search**: Simply type the name of the province, shop, or location, and hit the search button (🔍). The app will perform an automated search to get accurate geographic coordinates (powered by Nominatim).
- **Manual Map Pinning 📍**: Simply choose the Pin option and click anywhere on the map to pinpoint an exact custom location for starting or ending points.
- **Auto Battery Prediction**: Automatically identifies if the trip will exceed your car's range based on the live battery percentage.
- **Smart EV Station Finder**: If the destination distance exceeds the available battery, the app automatically finds and drops charging station pins that support your car's charging type (AC/DC) along with Google Maps navigation links.

## 🚀 Quick Start Guide (How to Use)

1. **Origin (ต้นทาง)**: Type your starting location (e.g., `กรุงเทพมหานคร`) and hit the 🔍 button OR hit the 📍 icon and drop a pin on the visual map.
2. **Destination (ปลายทาง)**: Enter your arrival text and hit 🔍 OR select using the map pin tool (📍).
3. **Vehicle Profile**: Select your EV Class `(Lumin L AC หรือ Lumin L DC)`.
4. **Current Battery**: Slide or type your current dashboard battery percentage (%).
5. **Calculate**: Hit the calculation button `คำนวณการเดินทาง`.

The map will auto-zoom, draw points, estimate the exact physical distance, comparing it against the mathematical degradation algorithm, and warn you if charging is required mid-trip!

## 📂 Project Structure

- `index.html`: The main web interface structure.
- `css/style.css`: Contains the UI branding, floating windows, interactive styling, and responsive behaviors.
- `js/app.js`: Core scripting logics—Leaflet map initialization, distance parsing, geolocation querying, and range calculators.
- `data/stations.json`: Simulated JSON database for EV charging stations (EA Anywhere, PEA VOLTA, Elexa, PTT, etc.) holding lat/long and supported plug types.

## 🛠️ Technologies Used

- **HTML5 / CSS3 / Vanilla JavaScript**
- [Leaflet.js](https://leafletjs.com/) for map interactive visualization.
- [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) for location text-to-coordinates processing.

## 👤 Credits & Contributors

- **Designed & Contributed by**: Mr. Abdulloh Etaeluengoh
- **Email**: <a href="mailto:Abdulloh.eg@gmail.com">Abdulloh.eg@gmail.com</a>

---

*This application is a client-side (frontend) demo and runs entirely in your web browser. No backend databases or complicated installations required. To install, simply clone the repository and open `index.html`.*