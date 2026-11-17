// =====================================================================
//  Park In · Recintos simulados
//  Los lugares y su ocupación son de prueba. "libres" cambia solo cada
//  pocos segundos para simular disponibilidad en vivo.
// =====================================================================
const RECINTOS = [
  { id: 'fundidora',  nombre: 'Parque Fundidora',      zona: 'Monterrey',           emoji: '🌳', lat: 25.6786, lng: -100.2842, tarifa: 25, capacidad: 400, libres: 182 },
  { id: 'sultanes',   nombre: 'Estadio Sultanes',      zona: 'Monterrey',           emoji: '⚾', lat: 25.7182, lng: -100.3156, tarifa: 40, capacidad: 250, libres: 0,   fijo: true },
  { id: 'lafe',       nombre: 'Paseo La Fe',           zona: 'San Nicolás / Apodaca', emoji: '🛍️', lat: 25.7260, lng: -100.2310, tarifa: 20, capacidad: 600, libres: 311 },
  { id: 'uanl',       nombre: 'Estadio UANL (Volcán)', zona: 'San Nicolás',         emoji: '🏟️', lat: 25.7230, lng: -100.3120, tarifa: 50, capacidad: 500, libres: 0,   fijo: true },
  { id: 'galerias',   nombre: 'Galerías Monterrey',    zona: 'Monterrey',           emoji: '🛍️', lat: 25.6700, lng: -100.3550, tarifa: 30, capacidad: 700, libres: 96 },
  { id: 'pastora',    nombre: 'Parque La Pastora',     zona: 'Guadalupe',           emoji: '🌳', lat: 25.6660, lng: -100.2480, tarifa: 15, capacidad: 220, libres: 17 },
  { id: 'macroplaza', nombre: 'Macroplaza Centro',     zona: 'Monterrey Centro',    emoji: '🏛️', lat: 25.6700, lng: -100.3095, tarifa: 35, capacidad: 320, libres: 64 },
  { id: 'cintermex',  nombre: 'Cintermex',             zona: 'Monterrey',           emoji: '🎪', lat: 25.6770, lng: -100.2893, tarifa: 45, capacidad: 450, libres: 205 }
];

function getRecinto(id) { return RECINTOS.find(r => r.id === id) || null; }

// Estado visual según lugares libres
function estadoRecinto(r) {
  if (r.libres <= 0) return { k: 'lleno', label: 'Lleno' };
  if (r.libres / r.capacidad <= 0.15) return { k: 'casi', label: 'Casi lleno' };
  return { k: 'libre', label: 'Disponible' };
}

// Simulación de ocupación en vivo (los recintos "fijo" se quedan llenos)
function simularOcupacion() {
  RECINTOS.forEach(r => {
    if (r.fijo) return;
    const delta = Math.floor(Math.random() * 7) - 3;           // -3 … +3
    r.libres = Math.max(1, Math.min(r.capacidad, r.libres + delta));
  });
}

// Payloads de los códigos QR
//   Entrada (lo muestra el usuario):  PARKIN|IN|<userId>|<recintoId>|<nonce>
//   Salida  (está en la salida):      PARKIN|OUT|<recintoId>
const QR_PREFIX = 'PARKIN';
function qrEntrada(userId, recintoId, nonce) { return [QR_PREFIX, 'IN', userId, recintoId, nonce].join('|'); }
function qrSalida(recintoId) { return [QR_PREFIX, 'OUT', recintoId].join('|'); }
function parseQr(texto) {
  const p = String(texto || '').trim().split('|');
  if (p[0] !== QR_PREFIX) return null;
  if (p[1] === 'OUT' && p[2]) return { tipo: 'OUT', recintoId: p[2] };
  if (p[1] === 'IN' && p[2] && p[3]) return { tipo: 'IN', userId: p[2], recintoId: p[3], nonce: p[4] || '' };
  return null;
}