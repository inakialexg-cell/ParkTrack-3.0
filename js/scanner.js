let html5QrCode = null;
let cameraActive = false;

// Iniciar sección de QR y verificar estado actual
function initScannerSection() {
  actualizarVistaQR();
}

function actualizarVistaQR() {
  const container = document.getElementById('qrStatusContainer');
  if (!container) return;

  // 1. CASO: HAY UNA RESERVACIÓN ACTIVA (Apartado desde recintos - Estilo Arcoíris)
  if (typeof reservaActiva !== 'undefined' && reservaActiva) {
    if (reservaActiva.estado === 'RESERVADO') {
      container.innerHTML = `
        <div class="bg-slate-900/90 border-2 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[2px] rounded-2xl mb-3 shadow-xl text-left">
          <div class="bg-slate-950 p-3 rounded-2xl space-y-1">
            <div class="flex justify-between items-center">
              <span class="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">🌈 Reservación Arcoíris</span>
              <span class="text-xs text-pink-400 font-bold">${reservaActiva.folio}</span>
            </div>
            <p class="text-sm font-bold text-white pt-1">🏟️ Recinto: ${reservaActiva.recintoNombre}</p>
            <p class="text-[11px] text-slate-300">Cajón apartado ($${reservaActiva.tarifa}/hr)</p>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl inline-block shadow-inner">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=9333ea&bgcolor=ffffff&data=RESERVACION-ARCOIRIS-${reservaActiva.folio}-${reservaActiva.recintoId}" alt="QR Reservación" class="w-44 h-44 mx-auto">
        </div>
        <div class="pt-3">
          <button onclick="simularEntradaReserva()" class="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition shadow-lg">
            🚗 Registrar Entrada al Recinto
          </button>
        </div>
      `;
    } else if (reservaActiva.estado === 'DENTRO') {
      container.innerHTML = `
        <div class="bg-gradient-to-r from-amber-950/60 to-amber-900/30 border-2 border-amber-500 p-3.5 rounded-2xl mb-3 shadow-lg text-left space-y-1">
          <div class="flex justify-between items-center">
            <span class="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">🚗 Estancia Activa</span>
            <span class="text-xs text-amber-400 font-bold">${reservaActiva.folio}</span>
          </div>
          <p class="text-sm font-bold text-white pt-1">🏟️ Recinto: ${reservaActiva.recintoNombre}</p>
          <p class="text-[11px] text-slate-300">Entrada registrada a las: ${reservaActiva.horaEntrada}</p>
        </div>
        <div class="bg-white p-4 rounded-xl inline-block shadow-inner">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SALIDA-${reservaActiva.folio}-${reservaActiva.recintoId}" alt="QR Salida" class="w-44 h-44 mx-auto">
        </div>
        <div class="pt-3">
          <button onclick="simularSalidaReserva()" class="w-full bg-brandRed hover:bg-red-600 text-white font-bold py-3 rounded-xl transition shadow-lg">
            🏁 Registrar Salida y Pagar 💳
          </button>
        </div>
      `;
    }
    return;
  }

  // 2. CASO: NO HAY RESERVACIÓN PERO HAY UN TICKET ACTIVO GENERAL
  if (ticketActivo) {
    container.innerHTML = `
      <p class="text-xs text-brandGreen font-bold">🚗 Tienes un estacionamiento en curso (Folio: ${ticketActivo.folio})</p>
      <p class="text-xs text-slate-400">Escanea el código QR en la salida o enciende la cámara:</p>
      
      <div class="bg-white p-4 rounded-xl inline-block shadow-inner">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PARKTRACK_SALIDA_${ticketActivo.folio}" alt="QR Salida" class="w-36 h-36 mx-auto">
      </div>

      <div class="pt-2 space-y-2">
        <button onclick="procesarSalida()" class="w-full bg-brandRed hover:bg-red-600 text-white font-bold py-3 rounded-xl transition shadow-lg">
          🏁 Simular Escaneo de Salida (Plumilla)
        </button>
        <button id="btnToggleCamera" onclick="toggleCameraScanner()" class="w-full bg-slate-800 border border-slate-700 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-700 transition">
          📷 Encender Cámara para Escanear
        </button>
      </div>
    `;
    return;
  }

  // 3. CASO POR DEFECTO: NO HAY NADA (MOSTRAR QR GENERAL DE ENTRADA)
  container.innerHTML = `
    <p class="text-xs text-slate-400">Genera tu boleto de entrada para acceder al recinto.</p>
    <div class="bg-white p-4 rounded-xl inline-block shadow-inner">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PARKTRACK_ACCESO_ENTRADA" alt="QR Entrada" class="w-44 h-44 mx-auto">
    </div>
    <div class="pt-2">
      <button onclick="generarBoletoEntrada()" class="w-full bg-brandBlue hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition shadow-lg">
        🎟️ Generar Boleto de ENTRADA
      </button>
    </div>
  `;
}

// Simular Entrada de la Reservación
function simularEntradaReserva() {
  if (!reservaActiva) return;
  const ahora = new Date();
  reservaActiva.estado = 'DENTRO';
  reservaActiva.horaEntrada = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  actualizarVistaQR();
  alert(`¡Entrada registrada al recinto ${reservaActiva.recintoNombre}! Disfrute su estancia.`);
}

// Simular Salida de la Reservación, Cobro y Limpieza del Apartado
function simularSalidaReserva() {
  if (!reservaActiva) return;

  if (!tarjetaRegistrada) {
    alert("⚠️ ACCIÓN DENEGADA: No puedes procesar la salida ni realizar cobros sin tener una tarjeta de crédito registrada en tu perfil.");
    switchTab('perfil');
    return;
  }

  const costoSimulado = reservaActiva.tarifa * 1.0; // 1 hora simulada o tarifa base
  const horaSalidaStr = new Date().toLocaleTimeString();

  if (saldo >= costoSimulado) {
    saldo -= costoSimulado;
  } else {
    deuda += (costoSimulado - saldo);
    saldo = 0;
    alert("Saldo insuficiente cubierto con tu tarjeta de crédito vinculada.");
  }

  // Registrar en historial local
  if (!window.historialBoletos) window.historialBoletos = [];
  window.historialBoletos.unshift({
    folio: reservaActiva.folio,
    recinto: reservaActiva.recintoNombre,
    entrada: reservaActiva.horaEntrada || '12:00',
    salida: horaSalidaStr,
    costo: costoSimulado,
    estado: "Completado"
  });

  const nombreRecintoCompletado = reservaActiva.recintoNombre;

  // LIMPIAR LA RESERVACIÓN Y LIBERAR EL ESPACIO DEL RECINTO
  reservaActiva = null; 

  stopCamera();
  actualizarUI();
  if (typeof calcularDisponibilidadPorHora === 'function') {
    calcularDisponibilidadPorHora(); // Libera el cajón y actualiza recintos
  }
  actualizarVistaQR();

  alert(`¡Salida procesada con éxito en ${nombreRecintoCompletado}! Cobro de $${costoSimulado.toFixed(2)} MXN aplicado.`);
}

// Generar Boleto de Entrada General
function generarBoletoEntrada() {
  const folioGen = `#PT-${Math.floor(Math.random() * 9000 + 1000)}`;
  ticketActivo = {
    folio: folioGen,
    recinto: "Parque Fundidora / General",
    horaEntrada: new Date().toLocaleTimeString(),
    timestampEntrada: Date.now()
  };

  alert(`¡Boleto ${folioGen} generado con éxito! Ya puedes ingresar.`);
  actualizarVistaQR();
  actualizarUI();
}

// Procesar Salida General y Guardar en Historial
function procesarSalida() {
  if (!ticketActivo) return;

  if (!tarjetaRegistrada) {
    alert("⚠️ ACCIÓN DENEGADA: No puedes procesar la salida ni realizar cargos sin tener una tarjeta de crédito registrada en tu perfil.");
    switchTab('perfil');
    return;
  }

  const costoSimulado = 40.00;
  const horaSalidaStr = new Date().toLocaleTimeString();

  if (saldo >= costoSimulado) {
    saldo -= costoSimualdo || costoSimulado;
  } else {
    deuda += (costoSimulado - saldo);
    saldo = 0;
    alert("Saldo insuficiente cubierto con tu tarjeta de crédito vinculada.");
  }

  const registroHistorial = {
    folio: ticketActivo.folio,
    recinto: ticketActivo.recinto,
    entrada: ticketActivo.horaEntrada,
    salida: horaSalidaStr,
    costo: costoSimulado,
    estado: "Completado"
  };

  if (!window.historialBoletos) window.historialBoletos = [];
  window.historialBoletos.unshift(registroHistorial);

  ticketActivo = null;
  stopCamera();
  actualizarVistaQR();
  actualizarUI();

  alert("¡Salida procesada por la plumilla con éxito! Cobro aplicado a tu tarjeta.");
}

// Control de Cámara Web
function toggleCameraScanner() {
  if (cameraActive) {
    stopCamera();
  } else {
    startCamera();
  }
}

function startCamera() {
  const readerDiv = document.getElementById('reader');
  if (!readerDiv) return;

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 200, height: 200 } },
    (decodedText) => {
      console.log("QR Escaneado:", decodedText);
      if (decodedText.includes("RESERVACION")) {
        simularEntradaReserva();
      } else if (decodedText.includes("SALIDA") || reservaActiva?.estado === 'DENTRO') {
        simularSalidaReserva();
      } else if (decodedText.includes("ENTRADA") && !ticketActivo) {
        generarBoletoEntrada();
      }
      stopCamera();
    },
    () => {}
  ).then(() => {
    cameraActive = true;
    const btn = document.getElementById('btnToggleCamera');
    if (btn) btn.innerText = "🔴 Apagar Cámara";
  }).catch(err => {
    console.error("Error al iniciar cámara:", err);
    alert("No se pudo acceder a la cámara.");
  });
}

function stopCamera() {
  if (html5QrCode && cameraActive) {
    html5QrCode.stop().then(() => {
      cameraActive = false;
      const btn = document.getElementById('btnToggleCamera');
      if (btn) btn.innerText = "📷 Encender Cámara para Escanear";
    }).catch(err => console.error("Error deteniendo cámara:", err));
  }
}