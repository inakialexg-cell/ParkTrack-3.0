let mapInitialized = false;

function initMap() {
  if (mapInitialized) return;

  // Centro en Monterrey y zona metropolitana
  const map = L.map('map').setView([25.686613, -100.316113], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const recintos = [
    { nombre: "Parque Fundidora", coords: [25.678, -100.284], estado: "Verde" },
    { nombre: "Estadio Sultanes", coords: [25.718, -100.316], estado: "Rojo" },
    { nombre: "Parque La Pastora", coords: [25.666, -100.248], estado: "Verde" },
    { nombre: "Paseo La Fe", coords: [25.726, -100.231], estado: "Verde" },
    { nombre: "Estadio UANL (Volcán)", coords: [25.727, -100.312], estado: "Rojo" },
    { nombre: "Galerías Monterrey", coords: [25.670, -100.355], estado: "Verde" }
  ];

  recintos.forEach(r => {
    const color = r.estado === "Verde" ? "#10B981" : "#EF4444";
    const marker = L.circleMarker(r.coords, {
      color: color,
      fillColor: color,
      fillOpacity: 0.8,
      radius: 9
    }).addTo(map);

    marker.bindPopup(`<b>${r.nombre}</b><br>Estado: <span style="color:${color}; font-weight:bold;">${r.estado === "Verde" ? "Disponible" : "Lleno"}</span>`);
  });

  mapInitialized = true;
}