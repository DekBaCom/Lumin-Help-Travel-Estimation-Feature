# 🚙 Lumin Help - EV Trip Planner

Lumin Help is a smart travel estimation tool designed specifically for **Changan Lumin L** EV owners. The application provides an interactive geographic map allowing users to pinpoint or search their origin and destination to accurately estimate travel viability based on the remaining battery percentage and car model. 

If the battery range is insufficient, the system provides reliable recommendations for EV charging station locations right before your battery is predicted to run out!

---

## ✨ Features

- **Model Specific Calculations**: Choose between `Lumin L AC` (Max Range: 210km) and `Lumin L DC` (Max Range: 301km).
- **Interactive Routing System**: Powered by [Leaflet.js](https://leafletjs.com/) and **Project OSRM**, the map plots the *actual driving route* along physical roads, computing highly accurate distances.
- **Intelligent 3-Color Route Degradation**: The route graph intuitively splits GPS coordinates to display 3 colored segments representing battery health:
  - 🟢 **Green (Safe)**: Sufficient battery (>30% remaining).
  - 🟡 **Yellow (Warning)**: Low battery zone (<30% remaining). It is recommended to route to a station in this segment.
  - 🔴 **Red Dashed (Depleted)**: The predicted physical location where the EV will completely drain its battery (includes a precise 🪫 pin marker).
- **Smart EV Station Finder**: If the destination distance exceeds the available battery, the app automatically finds and drops charging station pins that support your car's charging type (AC/DC) along with Google Maps navigation links.
- **Smart Geocoding Search**: Simply type the name of the province, shop, or location, and hit the search button (🔍). 
- **Manual Map Pinning 📍**: Alternatively, use the Pin option and click anywhere on the map to pinpoint an exact custom location.
- **Google Maps Integration**: Instantly send your calculated origin and destination directly into Google Maps to seamlessly launch native driving directions!
- **Responsive "Any Device" Design**: Fluid UI that works beautifully across all platforms. Automatically adapts to a modern **Bottom-Sheet Drawer** behavior on smartphones, mimicking premium native mapping applications!
- **Dedicated Instruction Page**: A beautifully designed `/howto.html` page detailing map usage rules and graphical legends.

## 🚀 Quick Start Guide

1. Clone the repository and simply open `index.html` in any web browser.
2. **Origin (ต้นทาง)**: Type your starting location and hit 🔍, OR hit 📍 and drop a pin on the visual map.
3. **Destination (ปลายทาง)**: Enter your arrival text and hit 🔍, OR select using the map pin tool (📍).
4. **Vehicle Profile**: Select your EV Class `(Lumin L AC หรือ Lumin L DC)`.
5. **Current Battery**: Enter your dashboard battery percentage (%).
6. **Calculate**: Click `คำนวณการเดินทาง`.
7. **Navigate**: If you're ready, hit the green `🗺️ นำทางด้วย Google Maps` button to launch immediate driving directions!

> 💡 **Need Help?** You can click the "💡 วิธีใช้" (How-To) button directly within the app to seamlessly read an immersive graphical guide on how the mapping system works.

## 📂 Project Structure

- `index.html`: The main web interface structure.
- `howto.html`: Responsive instructions and feature legend documentation page.
- `css/style.css`: Contains the UI branding, smartphone responsive logic, floating windows, and interactive styling.
- `js/app.js`: Core scripting logic—Leaflet map initialization, distance parsing using OSRM, battery capacity segmentation, geolocation querying, and range calculator.
- `data/stations.json`: Simulated JSON database for EV charging stations holding coordinates and supported plug types.

## 🛠️ Technologies Used

- **HTML5 / CSS3 / Vanilla JavaScript**
- [Leaflet.js](https://leafletjs.com/) for interactive map visualization.
- [Project OSRM](https://project-osrm.org/) API for actual road-following trip path drawing.
- [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) for location text-to-coordinates processing.

## 👤 Credits & Contributors

- **Designed & Contributed by**: Pangkung (Expertics Microsoft 365 Solution) & Mr. Abdulloh Etaeluengoh
- **Email**: <a href="mailto:Abdulloh.eg@gmail.com">Abdulloh.eg@gmail.com</a>

---

*This application is a client-side (frontend) demo and runs entirely in your web browser. No backend databases or complicated installations required.*