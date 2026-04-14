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
    const distanceMeters = map.distance(originMarker.getLatLng(), destinationMarker.getLatLng());
    // คูณ 1.3 เพื่อชดเชยความเป็นจริงให้ใกล้เคียงระยะทางถนนมากขึ้น
    let finalRouteDistance = Math.round((distanceMeters / 1000) * 1.3);
    if (finalRouteDistance < 1) finalRouteDistance = 1;

    // อัปเดต UI แสดงผลลัพธ์
    document.getElementById('result-panel').style.display = 'block';
    document.getElementById('res-distance').innerText = finalRouteDistance;
    document.getElementById('res-range').innerText = estimatedRange;

    const warningEl = document.getElementById('res-warning');

    // ตรวจสอบว่าแบตเตอรี่พอหรือไม่
    if (finalRouteDistance <= estimatedRange) {
        warningEl.style.backgroundColor = "#d4edda";
        warningEl.style.color = "#155724";
        warningEl.innerText = "✅ แบตเตอรี่เพียงพอ! คุณสามารถเดินทางถึงปลายทางได้โดยไม่ต้องแวะชาร์จ";
        markerLayerGroup.clearLayers(); // ล้างหมุดสถานีชาร์จถ้าแบตพอ
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

        // เลื่อนกล้อง (Zoom) แผนที่ให้ครอบคลุมทุกหมุด
        if (availableStations.length > 0) {
            const group = new L.featureGroup(markerLayerGroup.getLayers());
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }

    } catch (error) {
        console.error("Error loading stations:", error);
    }
}