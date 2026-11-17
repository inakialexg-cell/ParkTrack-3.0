let map = null;
let markersLayer = null;

function initMap() {
  // Si el mapa ya está creado, solo actualizamos los marcadores
  if (!map) {
    // Coordenadas centradas en Monterrey
    map = L.map('mapContainer').setView([25.6866, -100.3161], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
  }

  actualizarMarcadoresMapa();
}

function actualizarMarcadoresMapa() {
  if (!markersLayer) return;
  markersLayer.clearLayers(); // Limpiar pines anteriores

  // Asegurar que usamos recintosData (que ya tiene calculada la hora simulada y disponibilidad)
  if (typeof recintosData === 'undefined' || recintosData.length === 0) return;

  recintosData.forEach(r => {
    // Definir coordenadas geográficas aproximadas para cada recinto de Monterrey
    let coords = [25.6866, -100.3161]; // Default Monterrey centro
    if (r.id === 'fundidora') coords = [25.6778, -100.2845];
    if (r.id === 'sultanes') coords = [25.7175, -100.3442];
    if (r.id === 'lafe') coords = [25.7191, -100.2585];
    if (r.id === 'uanl') coords = [25.7278, -100.3122];
    if (r.id === 'galerias') coords = [25.6812, -100.3525];

    // Determinar el color y estado coherentes con las tarjetas
    let colorPin = '#2ee6a6'; // Verde (Disponible)
    let textoEstado = `${r.libres.toLocaleString()} libres`;
    
    const porcentajeLibre = (r.libres / r.capacidadTotal) * 100;

    if (r.libres === 0) {
      colorPin = '#ff5c6c'; // Rojo (Lleno)
      textoEstado = 'Lleno';
    } else if (porcentajeLibre <= 15) {
      colorPin = '#ffb84d'; // Amarillo/Ambar (Casi lleno)
      textoEstado = `Casi lleno (${r.libres})`;
    }

    // Crear un marcador circular personalizado en Leaflet
    const marker = L.circleMarker(coords, {
      radius: 10,
      fillColor: colorPin,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    });

    // Pop-up informativo sincronizado
    marker.bindPopup(`
      <div style="color: #000; font-family: sans-serif;">
        <b>${r.nombre}</b><br>
        Estado: <span style="font-weight: bold; color: ${colorPin};">${textoEstado}</span><br>
        Tarifa: $${r.tarifa}/hr
      </div>
    `);

    markersLayer.addLayer(marker);
  });
}