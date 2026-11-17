let map = null;
let markersLayer = null;

function initMap() {
  // Buscar el contenedor del mapa (soporta 'mapContainer' o 'map' por si acaso)
  const container = document.getElementById('mapContainer') || document.getElementById('map');
  if (!container) return;

  // Asegurar que el contenedor tenga altura mínima visible para Leaflet
  if (!container.style.height) {
    container.style.height = '280px';
  }

  // Si el mapa ya está creado, solo recalculamos su tamaño y actualizamos pines
  if (map) {
    setTimeout(() => {
      map.invalidateSize();
      actualizarMarcadoresMapa();
    }, 150);
    return;
  }

  // Coordenadas centradas en Monterrey
  map = L.map(container.id).setView([25.6866, -100.3161], 11);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // Forzar el renderizado correcto de los mosaicos del mapa tras mostrar la vista
  setTimeout(() => {
    map.invalidateSize();
    actualizarMarcadoresMapa();
  }, 200);
}

function actualizarMarcadoresMapa() {
  // Si el mapa aún no se ha inicializado pero ya existen datos, lo iniciamos primero
  if (!map) {
    initMap();
    return;
  }

  if (!markersLayer) return;
  markersLayer.clearLayers(); // Limpiar pines anteriores

  // Asegurar que usamos recintosData (que ya tiene calculada la hora simulada y disponibilidad)
  if (typeof recintosData === 'undefined' || recintosData.length === 0) return;

  recintosData.forEach(r => {
    // Coordenadas geográficas exactas para cada recinto de Monterrey
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
      colorPin = '#ffb84d'; // Amarillo/Ámbar (Casi lleno)
      textoEstado = `Casi lleno (${r.libres})`;
    }

    // Crear un marcador circular personalizado en Leaflet
    const marker = L.circleMarker(coords, {
      radius: 10,
      fillColor: colorPin,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    });

    // Pop-up informativo sincronizado
    marker.bindPopup(`
      <div style="font-family: 'Outfit', sans-serif; padding: 2px;">
        <b style="font-size: 13px;">${r.nombre}</b><br>
        <span style="font-size: 12px;">Estado: <b style="color: ${colorPin};">${textoEstado}</b></span><br>
        <span style="font-size: 11px; color: #94a3b8;">Tarifa: $${r.tarifa}/hr</span>
      </div>
    `);

    markersLayer.addLayer(marker);
  });
}

// Inicializar automáticamente cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  initMap();
});