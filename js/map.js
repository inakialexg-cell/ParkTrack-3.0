let mapInstance = null;

function initMap() {
  if (mapInstance) {
    mapInstance.invalidateSize();
    return;
  }

  // Coordenadas centradad en Estadio Sultanes / Monterrey - Apodaca
  mapInstance = L.map('mapa-container').setView([25.7258, -100.3142], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapInstance);

  const estacionamientos = [
    { nombre: "Estadio Sultanes", lat: 25.7258, lng: -100.3142, tarifa: "$20/hr", tarifaNum: 20 },
    { nombre: "Apodaca Centro", lat: 25.7813, lng: -100.1886, tarifa: "$15/hr", tarifaNum: 15 },
    { nombre: "Parque Fundidora", lat: 25.6775, lng: -100.2858, tarifa: "$25/hr", tarifaNum: 25 }
  ];

  estacionamientos.forEach(e => {
    L.marker([e.lat, e.lng]).addTo(mapInstance)
      .bindPopup(`
        <div class="p-1 text-center">
          <strong class="text-sm">${e.nombre}</strong><br>
          <span class="text-xs text-green-600 font-bold">Tarifa: ${e.tarifa}</span><br>
          <button onclick="simularEntrada('${e.nombre}', ${e.tarifaNum})" class="mt-2 bg-parkOrange text-white text-xs px-3 py-1 rounded-lg">Estacionar Aquí</button>
        </div>
      `);
  });
}

function simularEntrada(lugar, tarifa) {
  const boleto = {
    folio: "PT-" + Math.floor(100000 + Math.random() * 900000),
    lugar: lugar,
    tarifa: tarifa,
    horaEntrada: new Date().toISOString()
  };
  localStorage.setItem('boletoActivo', JSON.stringify(boleto));
  alert(`¡Boleto generado en ${lugar}!\nFolio: ${boleto.folio}`);
}