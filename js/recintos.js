// Catálogo y capacidades reales de estacionamiento por recinto en Monterrey
const recintosBase = [
  { id: 'fundidora', nombre: 'Parque Fundidora (E1-E10)', zona: 'Monterrey', capacidadTotal: 3200, tarifa: 35, tipo: 'parque' },
  { id: 'sultanes', nombre: 'Estadio Mobil Super (Sultanes)', zona: 'Monterrey', capacidadTotal: 2500, tarifa: 50, tipo: 'estadio' },
  { id: 'lafe', nombre: 'Paseo La Fe', zona: 'San Nicolás / Apodaca', capacidadTotal: 2800, tarifa: 25, tipo: 'plaza' },
  { id: 'uanl', nombre: 'Estadio Universitario (UANL)', zona: 'San Nicolás', capacidadTotal: 4500, tarifa: 45, tipo: 'estadio' },
  { id: 'galerias', nombre: 'Galerías Monterrey', zona: 'Monterrey', capacidadTotal: 3500, tarifa: 30, tipo: 'plaza' }
];

let recintosData = [];
let horaSimuladaOffset = 0; 

// Función para subir o bajar la hora desde los botones flotantes
function cambiarHora(cantidad) {
  horaSimuladaOffset += cantidad;
  calcularDisponibilidadPorHora();
}

// Calcula la disponibilidad según la hora simulada
function calcularDisponibilidadPorHora() {
  const ahora = new Date();
  let hora = (ahora.getHours() + horaSimuladaOffset) % 24;
  if (hora < 0) hora += 24;
  
  const labelHora = document.getElementById('horaActualRecintos');
  if (labelHora) {
    labelHora.innerText = `${String(hora).padStart(2, '0')}:00 hrs`;
  }

  recintosData = recintosBase.map(r => {
    let factorOcupacion = 0.25; 

    if (r.tipo === 'plaza') {
      if (hora >= 13 && hora <= 20) factorOcupacion = 0.88;
      else if (hora >= 10 && hora < 13) factorOcupacion = 0.55;
      else if (hora > 20 && hora <= 22) factorOcupacion = 0.65;
    } else if (r.tipo === 'parque') {
      if (hora >= 16 && hora <= 21) factorOcupacion = 0.82;
      else if (hora >= 9 && hora < 16) factorOcupacion = 0.45;
    } else if (r.tipo === 'estadio') {
      if (hora >= 19 && hora <= 23) factorOcupacion = 1.0; 
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

// Renderizar tarjetas de recintos con barra lateral flotante para ajustar hora
function renderRecintos() {
  const container = document.getElementById('listaRecintosContainer');
  if (!container) return;

  // Inyectamos también una barra lateral flotante móvil para subir/bajar hora con elegancia
  let htmlContenido = `
    <!-- BARRA LATERAL / FLOTANTE MÓVIL PARA CONTROL DE HORA -->
    <div class="bg-brandCard/90 backdrop-blur border border-slate-800 p-2.5 rounded-2xl flex justify-between items-center shadow-lg">
      <div class="flex items-center gap-2">
        <span class="text-base">🕒</span>
        <div>
          <p class="text-[11px] text-slate-400 font-medium">Hora Simulada</p>
          <p id="horaActualRecintos" class="text-xs font-bold text-white">--:--</p>
        </div>
      </div>
      <div class="flex gap-1.5">
        <button onclick="cambiarHora(-1)" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 active:scale-95 transition">
          ◀ -1h
        </button>
        <button onclick="cambiarHora(1)" class="bg-brandBlue/20 hover:bg-brandBlue/30 text-brandBlue px-3 py-1.5 rounded-xl text-xs font-bold border border-brandBlue/40 active:scale-95 transition">
          +1h ▶
        </button>
      </div>
    </div>
  `;

  htmlContenido += recintosData.map(r => {
    const porcentajeLibre = (r.libres / r.capacidadTotal) * 100;
    const esMiReserva = typeof reservaActiva !== 'undefined' && reservaActiva && reservaActiva.recintoId === r.id;

    let estadoBadge = '';
    let colorBarra = 'bg-brandGreen';

    if (r.libres === 0) {
      estadoBadge = `<span class="bg-red-500/10 text-brandRed border border-red-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">● Lleno</span>`;
      colorBarra = 'bg-brandRed';
    } else if (porcentajeLibre <= 15) {
      estadoBadge = `<span class="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">● Casi lleno (${r.libres})</span>`;
      colorBarra = 'bg-amber-400';
    } else {
      estadoBadge = `<span class="bg-emerald-500/10 text-brandGreen border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">● ${r.libres.toLocaleString()} libres</span>`;
      colorBarra = 'bg-brandGreen';
    }

    const porcentajeOcupado = Math.min(100, Math.round(((r.capacidadTotal - r.libres) / r.capacidadTotal) * 100));

    return `
      <div class="bg-brandCard p-3.5 rounded-2xl border ${esMiReserva ? 'border-brandBlue' : 'border-slate-800'} space-y-2.5 transition">
        <div class="flex justify-between items-start gap-2">
          <div>
            <h3 class="font-bold text-xs text-white">${r.nombre}</h3>
            <span class="text-[11px] text-slate-400">${r.zona} • $${r.tarifa}/hr</span>
          </div>
          ${estadoBadge}
        </div>

        <div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div class="${colorBarra} h-full transition-all duration-300" style="width: ${porcentajeOcupado}%"></div>
        </div>

      ${r.libres > 0 || esMiReserva ? `
          <button onclick="${esMiReserva ? "switchTab('escaneo')" : `apartarLugar('${r.id}')`}" 
            class="w-full py-2 rounded-xl text-xs font-bold transition active:scale-98 ${
              esMiReserva 
                ? 'bg-brandBlue/20 text-brandBlue border border-brandBlue/40 cursor-pointer hover:bg-brandBlue/30' 
                : 'bg-brandGreen hover:bg-emerald-600 text-brandDark shadow-md'
            }">
            ${esMiReserva ? '✓ Lugar Apartado (Ver Burbuja QR)' : '🅿️ Apartar 1 Cajón'}
          </button>
        ` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = htmlContenido;
}

// Función para apartar y redirigir directamente al menú de QR con burbuja activa
function apartarLugar(recintoId) {
  const badgeTarjeta = document.getElementById('estadoTarjetaBadge');
  if (badgeTarjeta && badgeTarjeta.innerText.includes('NO REGISTRADA')) {
    alert("⚠️ Debes registrar una tarjeta en tu Perfil antes de apartar un lugar.");
    switchTab('perfil');
    return;
  }

  const recinto = recintosData.find(r => r.id === recintoId);
  if (!recinto || recinto.libres <= 0) return;

  recinto.libres -= 1;
  const folio = 'PT-' + Math.floor(1000 + Math.random() * 9000);

  // Crear la reserva activa (burbuja de QR)
  reservaActiva = {
    folio: folio,
    recintoId: recinto.id,
    recintoNombre: recinto.nombre,
    tarifa: recinto.tarifa,
    estado: 'RESERVADO', 
    horaEntrada: null
  };

  renderRecintos();
  if (typeof actualizarVistaQR === 'function') {
    actualizarVistaQR();
  }

  // Redirigir de inmediato al menú de QR como se solicitó
  switchTab('escaneo');
}

document.addEventListener("DOMContentLoaded", () => {
  calcularDisponibilidadPorHora();
});