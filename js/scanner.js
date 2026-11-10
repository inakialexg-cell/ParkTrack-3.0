let html5QrCode = null;
let cameraActive = false;

// Iniciar sección de QR y verificar estado actual
function initScannerSection() {
  actualizarVistaQR();
}

function actualizarVistaQR() {
  const container = document.getElementById('qrStatusContainer');
  if (!container) return;

  if (!ticketActivo) {
    // ESTADO: NO HAY BOLETE ACTIVO (MOSTRAR QR DE ENTRADA)
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
  } else {
    // ESTADO: BOLETO ACTIVO (MOSTRAR ESCÁNER Y QR DE SALIDA PARA LA PLUMILLA)
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
  }
}

// Generar Boleto de Entrada
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

// Procesar Salida y Guardar en Historial
function procesarSalida() {
  if (!ticketActivo) return;

  // REGLA DE NEGOCIO: No se puede realizar ningún cargo sin tarjeta registrada
  if (!tarjetaRegistrada) {
    alert("⚠️ ACCIÓN DENEGADA: No puedes procesar la salida ni realizar cargos sin tener una tarjeta de crédito registrada en tu perfil.");
    switchTab('perfil'); // Redirigir al usuario al perfil para que agregue su tarjeta
    return;
  }

  const costoSimulado = 40.00;
  const horaSalidaStr = new Date().toLocaleTimeString();

  if (saldo >= costoSimulado) {
    saldo -= costoSimulado;
  } else {
    deuda += (costoSimulado - saldo);
    saldo = 0;
    alert("Saldo insuficiente cubierto con tu tarjeta de crédito vinculada.");
  }

  // Registrar en el historial
  const registroHistorial = {
    folio: ticketActivo.folio,
    entrada: ticketActivo.horaEntrada,
    salida: horaSalidaStr,
    costo: costoSimulado,
    estado: "Completado"
  };

  if (!window.historialBoletos) window.historialBoletos = [];
  window.historialBoletos.unshift(registroHistorial);

  // Mostrar ticket final
  document.getElementById('ticketSalida').classList.remove('hidden');
  document.getElementById('ticketFolio').innerText = ticketActivo.folio;
  document.getElementById('ticketCosto').innerText = `$${costoSimulado.toFixed(2)} MXN`;
  document.getElementById('ticketSaldo').innerText = `$${saldo.toFixed(2)} MXN`;

  ticketActivo = null;
  stopCamera();
  actualizarVistaQR();
  actualizarUI();

  alert("¡Salida procesada por la plumilla con éxito! Cobro aplicado a tu tarjeta.");
}

  
// Control de Cámara Web para Escanear QR físico o simulado
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
      if (decodedText.includes("ENTRADA") && !ticketActivo) {
        generarBoletoEntrada();
      } else if (decodedText.includes("SALIDA") || ticketActivo) {
        procesarSalida();
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