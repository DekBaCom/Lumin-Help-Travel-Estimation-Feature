// ข้อมูลสเปครถยนต์ Changan Lumin L
const LUMIN_SPECS = {
    "AC": { maxRange: 210 }, // กิโลเมตร
    "DC": { maxRange: 301 }  // กิโลเมตร
};

let map;
let markerLayerGroup;
let pinMode = null;
let originMarker = null;
let destinationMarker = null;
let customPinLayerGroup;
let routeLayerGroup;

// 1. ฟังก์ชันเริ่มต้นสร้างแผนที่
function initMap() {
    // กำหนดจุดศูนย์กลางที่กรุงเทพฯ
    map = L.map('map').setView([13.7563, 100.5018], 8);

    // โหลดแผนที่จาก OpenStreetMap (ฟรี)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // สร้าง Layer สำหรับหมุดสถานีชาร์จ และ หมุดต้นทาง/ปลายทาง
    markerLayerGroup = L.layerGroup().addTo(map);
    customPinLayerGroup = L.layerGroup().addTo(map);
    routeLayerGroup = L.layerGroup().addTo(map);

    // จัดการการคลิกบนแผนที่เพื่อปักหมุด
    map.on('click', function(e) {
        if (!pinMode) return;
        
        const latlng = e.latlng;
        const latStr = latlng.lat.toFixed(6);
        const lngStr = latlng.lng.toFixed(6);
        const coordStr = `${latStr}, ${lngStr}`;
        
        if (pinMode === 'origin') {
            document.getElementById('origin').value = coordStr;
            if (originMarker) customPinLayerGroup.removeLayer(originMarker);
            originMarker = L.marker(latlng, { icon: createCustomIcon('#1a73e8', 'A') })
                .bindPopup('<div style="font-weight:bold; color:#1a73e8; font-size:14px;">📍 ต้นทาง</div>')
                .addTo(customPinLayerGroup);
            originMarker.openPopup();
            document.getElementById('btn-pin-origin').classList.remove('active');
        } else if (pinMode === 'destination') {
            document.getElementById('destination').value = coordStr;
            if (destinationMarker) customPinLayerGroup.removeLayer(destinationMarker);
            destinationMarker = L.marker(latlng, { icon: createCustomIcon('#dc3545', 'B') })
                .bindPopup('<div style="font-weight:bold; color:#dc3545; font-size:14px;">📍 ปลายทาง</div>')
                .addTo(customPinLayerGroup);
            destinationMarker.openPopup();
            document.getElementById('btn-pin-destination').classList.remove('active');
        }
        
        pinMode = null;
        document.getElementById('map').style.cursor = '';
        
        // ซูมให้เห็นทั้งสองหมุดถ้ามีครบ
        if (originMarker && destinationMarker) {
            const group = new L.featureGroup([originMarker, destinationMarker]);
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    });
}

// ฟังก์ชันเปิดโหมดปักหมุด
function enablePinMode(target) {
    document.getElementById('btn-pin-origin').classList.remove('active');
    document.getElementById('btn-pin-destination').classList.remove('active');

    if (pinMode === target) {
        pinMode = null;
        document.getElementById('map').style.cursor = '';
        return;
    }

    pinMode = target;
    document.getElementById(`btn-pin-${target}`).classList.add('active');
    document.getElementById('map').style.cursor = 'crosshair';
}

// ฟังก์ชันสร้างไอคอนหมุดแบบกำหนดเอง
function createCustomIcon(color, label) {
    return L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 2px 2px 6px rgba(0,0,0,0.5);"><div style="transform: rotate(45deg); font-size:14px;">${label}</div></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
    });
}

// ฟังก์ชันหลักดึงพิกัดจากชื่อสถานที่
async function geocodeIfMissing(type, text, forceSearch = false) {
    if (!forceSearch) {
        if ((type === 'origin' && originMarker) || (type === 'destination' && destinationMarker)) {
            return true; // มีหมุดอยู่แล้วข้ามไป
        }
    }
    
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1&countrycodes=th`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const bestMatch = data[0];
            const latlng = L.latLng(bestMatch.lat, bestMatch.lon);
            const displayName = bestMatch.display_name.split(',')[0]; // เอาชื่อสั้นๆ
            
            if (type === 'origin') {
                document.getElementById('origin').value = displayName;
                if (originMarker) customPinLayerGroup.removeLayer(originMarker);
                originMarker = L.marker(latlng, { icon: createCustomIcon('#1a73e8', 'A') })
                    .bindPopup(`<div style="font-weight:bold; color:#1a73e8; font-size:14px;">📍 ต้นทาง<br><small style="color:#666; font-weight:normal;">${displayName}</small></div>`)
                    .addTo(customPinLayerGroup);
                if (forceSearch) originMarker.openPopup();
            } else if (type === 'destination') {
                document.getElementById('destination').value = displayName;
                if (destinationMarker) customPinLayerGroup.removeLayer(destinationMarker);
                destinationMarker = L.marker(latlng, { icon: createCustomIcon('#dc3545', 'B') })
                    .bindPopup(`<div style="font-weight:bold; color:#dc3545; font-size:14px;">📍 ปลายทาง<br><small style="color:#666; font-weight:normal;">${displayName}</small></div>`)
                    .addTo(customPinLayerGroup);
                if (forceSearch) destinationMarker.openPopup();
            }

            if (forceSearch) map.setView(latlng, 12);
            
            // ซูมให้เห็น 2 จุด
            if (originMarker && destinationMarker) {
                const group = new L.featureGroup([originMarker, destinationMarker]);
                map.fitBounds(group.getBounds(), { padding: [50, 50] });
            }
            return true;
        } else {
            if (forceSearch) alert(`ไม่พบสถานที่ '${text}' กรุณาลองใช้คำค้นหาอื่น`);
        }
    } catch(err) {
        console.error("Geocode error:", err);
        if (forceSearch) alert('เกิดข้อผิดพลาดในการค้นหาสถานที่');
    }
    return false;
}

// ฟังก์ชันเมื่อกดปุ่มค้นหา (แว่นขยาย)
async function searchLocation(type) {
    const inputEl = document.getElementById(type);
    const query = inputEl.value;
    if (!query) {
        alert("กรุณาพิมพ์ชื่อสถานที่ที่ต้องการค้นหา");
        inputEl.focus();
        return;
    }

    const btn = event.currentTarget;
    const oldHtml = btn.innerHTML;
    btn.innerHTML = "⏳";
    btn.disabled = true;

    try {
        await geocodeIfMissing(type, query, true);
    } finally {
        btn.innerHTML = oldHtml;
        btn.disabled = false;
    }
}

// โหลดแผนที่ทันทีเมื่อเปิดเว็บ
initMap();

// 2. ฟังก์ชันหลักเมื่อกดปุ่ม "คำนวณการเดินทาง"
async function calculateRoute() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const carModel = document.getElementById('carModel').value;
    const battery = parseInt(document.getElementById('battery').value);

    if (!origin || !destination) {
        alert("กรุณาระบุต้นทางและปลายทางครับ");
        return;
    }

    // ดึงปุ่มมาให้แสดงสถานะกำลังโหลด
    const startBtn = document.querySelector('.btn-calculate');
    const oldBtnText = startBtn.innerText;
    startBtn.innerText = "กำลังค้นหาพิกัดและคำนวณ...";
    startBtn.style.opacity = "0.7";
    startBtn.disabled = true;

    // ค้นหาสถานที่อัตโนมัติถ้ายังไม่ได้ปักหมุด
    const originFound = await geocodeIfMissing('origin', origin);
    const destFound = await geocodeIfMissing('destination', destination);

    startBtn.innerText = oldBtnText;
    startBtn.style.opacity = "1";
    startBtn.disabled = false;

    if (!originFound || !destFound) {
        alert("ไม่สามารถค้นหาพิกัดของสถานที่ที่ระบุได้ กรุณาลองใช้ปุ่มค้นหา 🔍 หรือปักหมุด 📍 ให้ชัดเจนอีกครั้ง");
        return;
    }

    // คำนวณระยะทางที่วิ่งได้จริงจาก % แบตเตอรี่
    const maxRange = LUMIN_SPECS[carModel].maxRange;
    const estimatedRange = (maxRange * (battery / 100)).toFixed(0);

    // หาระยะทางจากหมุดจริงๆ
    let finalRouteDistance = 0;
    let routeCoords = null;
    
    try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originMarker.getLatLng().lng},${originMarker.getLatLng().lat};${destinationMarker.getLatLng().lng},${destinationMarker.getLatLng().lat}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            finalRouteDistance = Math.round(route.distance / 1000);
            routeCoords = route.geometry.coordinates;
        }
    } catch(err) {
        console.error("OSRM fetch error:", err);
    }
    
    // ถ้าระบบค้นหาเส้นทางถนนไม่ได้ (Fallback)
    if (!routeCoords) {
        const distanceMeters = map.distance(originMarker.getLatLng(), destinationMarker.getLatLng());
        finalRouteDistance = Math.round((distanceMeters / 1000) * 1.3);
    }
    if (finalRouteDistance < 1) finalRouteDistance = 1;

    // อัปเดต UI แสดงผลลัพธ์
    document.getElementById('result-panel').style.display = 'block';
    document.getElementById('res-distance').innerText = finalRouteDistance;
    document.getElementById('res-range').innerText = estimatedRange;

    const warningEl = document.getElementById('res-warning');

    // วาดเส้นกราฟิกแสดงเส้นทางที่เดินทางได้และส่วนที่เกิน
    routeLayerGroup.clearLayers();
    if (routeCoords) {
        const MAX_METERS = (maxRange * (battery / 100)) * 1000;
        const SAFE_METERS = Math.max(0, maxRange * ((battery - 30) / 100)) * 1000;
        
        let greenCoords = [];
        let yellowCoords = [];
        let redCoords = [];
        
        let startPoint = [routeCoords[0][1], routeCoords[0][0]];
        if (SAFE_METERS > 0) greenCoords.push(startPoint);
        else yellowCoords.push(startPoint);
        
        let currentMeters = 0;
        let pYellowSplit = null;
        let pRedSplit = null;
        
        for (let i = 1; i < routeCoords.length; i++) {
            const prevLngLat = routeCoords[i-1];
            const currLngLat = routeCoords[i];
            const p1 = [prevLngLat[1], prevLngLat[0]];
            const p2 = [currLngLat[1], currLngLat[0]];
            
            const dist = map.distance(L.latLng(p1), L.latLng(p2));
            const nextMeters = currentMeters + dist;
            
            // ข้ามจากช่วงปลอดภัย (Green) ไปช่วงใกล้หมด (Yellow)
            if (currentMeters <= SAFE_METERS && nextMeters > SAFE_METERS && SAFE_METERS > 0) {
                const ratio = (SAFE_METERS - currentMeters) / dist;
                pYellowSplit = [
                    p1[0] + (p2[0] - p1[0]) * ratio,
                    p1[1] + (p2[1] - p1[1]) * ratio
                ];
                greenCoords.push(pYellowSplit);
                yellowCoords.push(pYellowSplit);
            }
            
            // ข้ามจากช่วงแบตเตอรี่ไปเป็นช่วงหมด (Yellow -> Red)
            if (currentMeters <= MAX_METERS && nextMeters > MAX_METERS) {
                const ratio = (MAX_METERS - currentMeters) / dist;
                pRedSplit = [
                    p1[0] + (p2[0] - p1[0]) * ratio,
                    p1[1] + (p2[1] - p1[1]) * ratio
                ];
                yellowCoords.push(pRedSplit);
                redCoords.push(pRedSplit);
            }
            
            // เพิ่มจุดเข้าไปใน line ที่ถูกต้อง
            if (nextMeters <= SAFE_METERS) {
                greenCoords.push(p2);
            } else if (nextMeters <= MAX_METERS) {
                yellowCoords.push(p2);
            } else {
                redCoords.push(p2);
            }
            
            currentMeters = nextMeters;
        }
        
        const greenKm = Math.round(SAFE_METERS / 1000);
        const yellowKm = Math.round((MAX_METERS - SAFE_METERS) / 1000);
        const redKm = (finalRouteDistance - estimatedRange) > 0 ? Math.round(finalRouteDistance - estimatedRange) : 1;
        
        if (greenCoords.length > 0) {
            L.polyline(greenCoords, { color: '#28a745', weight: 6, opacity: 0.8 }).addTo(routeLayerGroup)
                .bindTooltip(`🔋 แบตเพียงพอ (>30%) ลากยาวได้อีก ${greenKm} กม.`, {sticky: true});
        }
        if (yellowCoords.length > 0) {
            L.polyline(yellowCoords, { color: '#ffb300', weight: 6, opacity: 0.9 }).addTo(routeLayerGroup)
                .bindTooltip(`⚠️ เหลือน้อย (<30%) วิ่งต่อได้อีก ${yellowKm} กม. ก่อนแบตหมด`, {sticky: true});
        }
        if (redCoords.length > 0) {
            L.polyline(redCoords, { color: '#dc3545', weight: 6, opacity: 0.8, dashArray: '10, 10' }).addTo(routeLayerGroup)
                .bindTooltip(`❌ ขาดแบตเตอรี่อีก ${redKm} กม. เลี่ยงไม่ได้`, {sticky: true});
            
            if (pRedSplit) {
                L.marker(pRedSplit, {
                    icon: L.divIcon({
                        className: 'battery-out-pin',
                        html: `<div style="background-color: white; width: 28px; height: 28px; border-radius: 50%; color: #dc3545; display: flex; align-items: center; justify-content: center; border: 2px solid #dc3545; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size:16px; font-family: sans-serif;" title="คาดแบตจะหมด">🪫</div>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    })
                }).bindPopup('<div style="color: #dc3545; font-weight: bold; text-align: center; font-family: sans-serif;">🪫 จุดคาดการณ์แบตเตอรี่หมด!<br><small style="color:#666; font-weight: normal;">ต้องชาร์จก่อนจะถึงจุดนี้</small></div>').addTo(routeLayerGroup);
            }
        }
    } else {
        // Fallback วาดเส้นตรงถ้าเรียก OSRM ไม่ได้
        const startLat = originMarker.getLatLng().lat;
        const startLng = originMarker.getLatLng().lng;
        const endLat = destinationMarker.getLatLng().lat;
        const endLng = destinationMarker.getLatLng().lng;
        
        const MAX_METERS = (maxRange * (battery / 100)) * 1000;
        const SAFE_METERS = Math.max(0, maxRange * ((battery - 30) / 100)) * 1000;
        
        const safeKm = Math.round(SAFE_METERS / 1000);
        const warningKm = Math.round((MAX_METERS - SAFE_METERS) / 1000);
        const unreachableKm = (finalRouteDistance - estimatedRange) > 0 ? Math.round(finalRouteDistance - estimatedRange) : 1;

        const ratioSafe = safeKm > 0 ? (SAFE_METERS / 1000) / finalRouteDistance : 0;
        const splitPointSafe = [
             startLat + (endLat - startLat) * ratioSafe,
             startLng + (endLng - startLng) * ratioSafe
        ];

        const ratioRed = (MAX_METERS / 1000) / finalRouteDistance;
        const splitPointRed = [
             startLat + (endLat - startLat) * ratioRed,
             startLng + (endLng - startLng) * ratioRed
        ];

        if (finalRouteDistance <= (SAFE_METERS / 1000)) {
             L.polyline([[startLat, startLng], [endLat, endLng]], { color: '#28a745', weight: 6, opacity: 0.8 }).addTo(routeLayerGroup)
                .bindTooltip(`🔋 แบตเพียงพอ (>30%) ลากยาวได้อีก ${safeKm} กม.`, {sticky: true});
        } else if (finalRouteDistance <= (MAX_METERS / 1000)) {
             if (safeKm > 0) {
                 L.polyline([[startLat, startLng], splitPointSafe], { color: '#28a745', weight: 6, opacity: 0.8 }).addTo(routeLayerGroup)
                    .bindTooltip(`🔋 แบตเพียงพอ (>30%) ลากยาวได้อีก ${safeKm} กม.`, {sticky: true});
             }
             L.polyline([splitPointSafe, [endLat, endLng]], { color: '#ffb300', weight: 6, opacity: 0.9 }).addTo(routeLayerGroup)
                .bindTooltip(`⚠️ เหลือน้อย (<30%) วิ่งต่อได้อีก ${warningKm} กม. ก่อนแบตหมด`, {sticky: true});
        } else {
             if (safeKm > 0) {
                 L.polyline([[startLat, startLng], splitPointSafe], { color: '#28a745', weight: 6, opacity: 0.8 }).addTo(routeLayerGroup)
                    .bindTooltip(`🔋 แบตเพียงพอ (>30%) ลากยาวได้อีก ${safeKm} กม.`, {sticky: true});
             }
             if (warningKm > 0) {
                 L.polyline([splitPointSafe, splitPointRed], { color: '#ffb300', weight: 6, opacity: 0.9 }).addTo(routeLayerGroup)
                    .bindTooltip(`⚠️ เหลือน้อย (<30%) วิ่งต่อได้อีก ${warningKm} กม. ก่อนแบตหมด`, {sticky: true});
             }
             L.polyline([splitPointRed, [endLat, endLng]], { color: '#dc3545', weight: 6, opacity: 0.8, dashArray: '10, 10' }).addTo(routeLayerGroup)
                .bindTooltip(`❌ ขาดแบตเตอรี่อีก ${unreachableKm} กม. เลี่ยงไม่ได้`, {sticky: true});
             
             L.marker(splitPointRed, {
                    icon: L.divIcon({
                        className: 'battery-out-pin',
                        html: `<div style="background-color: white; width: 28px; height: 28px; border-radius: 50%; color: #dc3545; display: flex; align-items: center; justify-content: center; border: 2px solid #dc3545; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size:16px; font-family: sans-serif;" title="คาดแบตจะหมด">🪫</div>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    })
                }).bindPopup('<div style="color: #dc3545; font-weight: bold; text-align: center; font-family: sans-serif;">🪫 จุดคาดการณ์แบตเตอรี่หมด!<br><small style="color:#666; font-weight: normal;">ต้องชาร์จก่อนจะถึงจุดนี้</small></div>').addTo(routeLayerGroup);
        }
    }

    // ตรวจสอบว่าแบตเตอรี่พอหรือไม่
    if (finalRouteDistance <= estimatedRange) {
        warningEl.style.backgroundColor = "#d4edda";
        warningEl.style.color = "#155724";
        warningEl.innerText = "✅ แบตเตอรี่เพียงพอ! คุณสามารถเดินทางถึงปลายทางได้โดยไม่ต้องแวะชาร์จ";
        markerLayerGroup.clearLayers(); // ล้างหมุดสถานีชาร์จถ้าแบตพอ
        
        // ซูมให้เห็นเส้นทาง
        const allLayers = [ originMarker, destinationMarker, ...routeLayerGroup.getLayers() ].filter(Boolean);
        if (allLayers.length > 0) {
            const group = new L.featureGroup(allLayers);
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    } else {
        warningEl.style.backgroundColor = "#f8d7da";
        warningEl.style.color = "#721c24";
        warningEl.innerText = `⚠️ แบตเตอรี่ไม่พอ! ระบบกำลังค้นหาสถานีหัวชาร์จแบบ ${carModel} บนแผนที่...`;

        // ค้นหาสถานีชาร์จและปักหมุด
        await findChargingStations(carModel);
    }
}

// 3. ฟังก์ชันดึงสถานีชาร์จและปักหมุด
async function findChargingStations(carType) {
    try {
        // โหลดข้อมูล JSON
        const response = await fetch('./data/stations.json');
        const stations = await response.json();

        // กรองเฉพาะสถานีที่มีหัวชาร์จตรงกับรุ่นรถ
        const availableStations = stations.filter(station => station.types.includes(carType));

        // ล้างหมุดเก่าออก
        markerLayerGroup.clearLayers();

        // นำสถานีที่กรองแล้วมาปักหมุด
        availableStations.forEach(station => {
            const marker = L.marker([station.lat, station.lng]);

            // สร้างลิงก์นำทางไปยัง Google Maps
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;

            // หน้าต่าง Popup เมื่อกดที่หมุด
            const popupContent = `
                <div style="font-size: 14px;">
                    <strong style="color: #1a73e8;">${station.name}</strong><br>
                    <span style="color: #666;">รองรับหัวชาร์จ: <b>${station.types.join(', ')}</b></span><br>
                    <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ccc;">
                    <a href="${googleMapsUrl}" target="_blank" style="text-decoration: none; color: white; background: #28a745; padding: 5px 10px; border-radius: 3px; display: inline-block;">📍 นำทางไปที่นี่</a>
                </div>
            `;
            marker.bindPopup(popupContent);
            markerLayerGroup.addLayer(marker);
        });

        // เลื่อนกล้อง (Zoom) แผนที่ให้ครอบคลุมทุกหมุดและเส้นทาง
        const allLayers = [
            ...markerLayerGroup.getLayers(),
            ...routeLayerGroup.getLayers(),
            originMarker,
            destinationMarker
        ].filter(Boolean);

        if (allLayers.length > 0) {
            const group = new L.featureGroup(allLayers);
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }

    } catch (error) {
        console.error("Error loading stations:", error);
    }
}

// อัปเดตแผนที่เมื่อมีการหมุนจอหรือย่อ/ขยายหน้าต่าง (Responsive Support)
window.addEventListener('resize', () => {
    if (map) {
        setTimeout(() => map.invalidateSize(), 200);
    }
});

// 4. ฟังก์ชันแชร์เส้นทางไปยัง Google Maps
function shareToGoogleMap() {
    if (!originMarker || !destinationMarker) {
        alert("กรุณาระบุต้นทางและปลายทางให้ครบถ้วนก่อนครับ");
        return;
    }
    
    const startLat = originMarker.getLatLng().lat;
    const startLng = originMarker.getLatLng().lng;
    const endLat = destinationMarker.getLatLng().lat;
    const endLng = destinationMarker.getLatLng().lng;

    // เปิด Google Maps แบบกำหนดต้นทางและปลายทางเพื่อนำทาง
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${endLat},${endLng}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
}