// Catálogo y capacidades reales de estacionamiento por recinto en Monterrey
const recintosBase = [
  { id: 'fundidora', nombre: 'Parque Fundidora (E1-E10)', zona: 'Monterrey', capacidadTotal: 3200, tarifa: 35, tipo: 'parque' },
  { id: 'sultanes', nombre: 'Estadio Mobil Super (Sultanes)', zona: 'Monterrey', capacidadTotal: 2500, tarifa: 50, tipo: 'estadio' },
  { id: 'lafe', nombre: 'Paseo La Fe', zona: 'San Nicolás / Apodaca', capacidadTotal: 2800, tarifa: 25, tipo: 'plaza' },
  { id: 'uanl', nombre: 'Estadio Universitario (UANL)', zona: 'San Nicolás', capacidadTotal: 4500, tarifa: 45, tipo: 'estadio' },
  { id: 'galerias', nombre: 'Galerías Monterrey', zona: 'Monterrey', capacidadTotal: 3500, tarifa: 30, tipo: 'plaza' }
];

let recintosData = [];
let horaSimuladaOffset = 0; // Controla el desfase de hora con los botones

// Función para subir o bajar la hora (-1 o +1)
function cambiarHora(cantidad) {
  horaSimuladaOffset += cantidad;
  calcularDisponibilidadPorHora();
}

// Calcula cuántos lugares libres hay según la hora simulada
function calcularDisponibilidadPorHora() {
  const ahora = new Date();
  // Calcula la hora cíclica entre 0 y 23
  let hora = (ahora.getHours() + horaSimuladaOffset) % 24;
  if (hora < 0) hora += 24;
  
  const labelHora = document.getElementById('horaActualRecintos');
  if (labelHora) {
    labelHora.innerText = `${String(hora).padStart(2, '0')}:00 hrs`;
  }

  recintosData = recintosBase.map(r => {
    let factorOcupacion = 0.25; // Madrugada

    if (r.tipo === 'plaza') {
      if (hora >= 13 && hora <= 20) factorOcupacion = 0.88;
      else if (hora >= 10 && hora < 13) factorOcupacion = 0.55;
      else if (hora > 20 && hora <= 22) factorOcupacion = 0.65;
    } else if (r.tipo === 'parque') {
      if (hora >= 16 && hora <= 21) factorOcupacion = 0.82;
      else if (hora >= 9 && hora < 16) factorOcupacion = 0.45;
    } else if (r.tipo === 'estadio') {
      if (hora >= 19 && hora <= 23) factorOcupacion = 1.0; // Lleno
      else if (hora >= 17 && hora < 19) factorOcupacion = 0.92;
      else factorOcupacion = 0.12;
    }

    const variacion = ((hora * 17 + r.capacidadTotal) % 45);
    let ocupados = Math.min(r.capacidadTotal, Math.floor(r.capacidadTotal * factorOcupacion) + variacion);
    if (factorOcupacion === 1.0) ocupados = r.capacidadTotal;

    const descuentoReserva = (typeof reservaActiva !== 'undefined' && reservaActiva && reservaActiva.recintoId === r.id) ? 1 : 0;
    const libres = Math.max(0, r.capacidadTotal - ocupados - descuentoReserva);

    return { ...r, libres };
  });

  renderRecintos();
}

// Renderizar tarjetas con barras de ocupación y botón de apartar
function renderRecintos() {
  const container = document.getElementById('listaRecintosContainer');
  if (!container) return;

  container.innerHTML = recintosData.map(r => {
    const porcentajeLibre = (r.libres / r.capacidadTotal) * 100;
    const esMiReserva = typeof reservaActiva !== 'undefined' && reservaActiva && reservaActiva.recintoId === r.id;

    let estadoBadge = '';
    let colorBarra = 'bg-brandGreen';

    if (r.libres === 0) {
      estadoBadge = `<span class="bg-red-500/10 text-brandRed border border-brandRed/30 text-xs px-2.5 py-1 rounded-full font-bold">● Lleno (0 / ${r.capacidadTotal})</span>`;
      colorBarra = 'bg-brandRed';
    } else if (porcentajeLibre <= 15) {
      estadoBadge = `<span class="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold">● Casi lleno (${r.libres} libres)</span>`;
      colorBarra = 'bg-amber-400';
    } else {
      estadoBadge = `<span class="bg-emerald-500/10 text-brandGreen border border-brandGreen/30 text-xs px-2.5 py-1 rounded-full font-bold">● ${r.libres.toLocaleString()} libres</span>`;
      colorBarra = 'bg-brandGreen';
    }

    const porcentajeOcupado = Math.min(100, Math.round(((r.capacidadTotal - r.libres) / r.capacidadTotal) * 100));

    return `
      <div class="bg-brandCard p-4 rounded-xl border ${esMiReserva ? 'border-brandBlue' : 'border-slate-800'} space-y-3 transition">
        <div class="flex justify-between items-start gap-2">
          <div>
            <h3 class="font-bold text-sm">${r.nombre}</h3>
            <span class="text-xs text-slate-400">${r.zona} • $${r.tarifa}/hr • Cap. ${r.capacidadTotal.toLocaleString()}</span>
          </div>
          ${estadoBadge}
        </div>

        <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div class="${colorBarra} h-full transition-all duration-500" style="width: ${porcentajeOcupado}%"></div>
        </div>

        ${r.libres > 0 || esMiReserva ? `
          <button onclick="apartarLugar('${r.id}')" 
            ${typeof reservaActiva !== 'undefined' && reservaActiva ? 'disabled' : ''}
            class="w-full py-2 rounded-xl text-xs font-bold transition ${
              esMiReserva 
                ? 'bg-brandBlue/20 text-brandBlue border border-brandBlue/40' 
                : typeof reservaActiva !== 'undefined' && reservaActiva 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-brandGreen hover:bg-emerald-600 text-brandDark'
            }">
            ${esMiReserva ? '✓ Cajón Apartado (Ir a Pase QR)' : typeof reservaActiva !== 'undefined' && reservaActiva ? 'Ya tienes un lugar activo' : '🅿️ Apartar 1 Cajón'}
          </button>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  calcularDisponibilidadPorHora();
});