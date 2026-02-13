// DAET CENTER COORDINATES
const DAET = [14.1122, 122.9550];

// Create Map
const map = L.map('map').setView(DAET, 14);

// Google-like street layer
const streetLayer = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
).addTo(map);

// Satellite layer
const satelliteLayer = L.tileLayer(
  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
);

// Layer control (Google-style switching)
L.control.layers({
    "Street View": streetLayer,
    "Satellite View": satelliteLayer
}).addTo(map);

// Storage
let hazards = [];
let planLayer = L.layerGroup().addTo(map);
let hazardLayer = L.layerGroup().addTo(map);

// AI Risk Model for Daet
function aiRiskScore(type) {
    const model = {
        flood: 9,
        typhoon: 8,
        storm_surge: 7,
        landslide: 6
    };
    return model[type] || 5;
}

// Random location inside Daet
function randomCoord() {
    const lat = DAET[0] + (Math.random() - 0.5) * 0.05;
    const lng = DAET[1] + (Math.random() - 0.5) * 0.05;
    return [lat, lng];
}

// Simulate hazard detection
function addHazard() {

    const types = ["flood", "typhoon", "storm_surge", "landslide"];
    const type = types[Math.floor(Math.random() * types.length)];

    const coord = randomCoord();
    const risk = aiRiskScore(type);

    const circle = L.circle(coord, {
        color: "red",
        fillColor: "#ff0000",
        fillOpacity: 0.4,
        radius: risk * 120
    }).addTo(hazardLayer);

    circle.bindPopup(`Hazard: ${type}<br>Risk Level: ${risk}`);

    hazards.push({type, coord, risk});
}

// Analyze Risk
function analyzeArea() {

    let total = hazards.reduce((sum, h) => sum + h.risk, 0);
    let avg = hazards.length ? (total / hazards.length).toFixed(2) : 0;

    document.getElementById("report").innerHTML =
        `<b>Daet Risk Analysis</b><br>
         Hazards: ${hazards.length}<br>
         Avg Risk: ${avg}<br>
         Risk Level: ${avg > 7 ? "HIGH" : avg > 4 ? "MODERATE" : "LOW"}`;
}

// AI Plan Generator
function generatePlan() {

    planLayer.clearLayers();

    hazards.forEach(h => {

        let solution = "";
        let offset = 0.003;

        if(h.type === "flood") solution = "Upgrade Drainage System";
        if(h.type === "typhoon") solution = "Build Evacuation Center";
        if(h.type === "storm_surge") solution = "Construct Sea Wall";
        if(h.type === "landslide") solution = "Slope Reinforcement";

        const newMarker = L.marker([
            h.coord[0] + offset,
            h.coord[1] + offset
        ]).addTo(planLayer);

        newMarker.bindPopup(`AI Recommendation:<br>${solution}`);
    });

    document.getElementById("report").innerHTML += 
        "<br><br><b>AI Final Plan Generated</b>";
}

// Export Plan
function exportPlan() {

    const data = JSON.stringify(hazards, null, 2);
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "daet_ai_plan.json";
    a.click();
}
