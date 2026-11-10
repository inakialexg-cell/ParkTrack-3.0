let html5QrCode = null;
let cameraActive = false;

// Iniciar la cámara automáticamente al entrar a la sección
function initScannerSection() {
  const readerElement = document.getElementById('reader');
  if (readerElement && !cameraActive) {
    startCamera();
  }
}

function toggleCameraScanner() {
  if (cameraActive) {
    stopCamera();
  } else {
    startCamera();
  }
}

function startCamera() {
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 220, height: 220 } },
    (decodedText) => {
      // Procesar texto escaneado del QR simulado en la plumilla
      console.log("QR Escaneado:", decodedText);
      if (decodedText.includes("ENTRADA") || !ticketActivo) {
        simularEntrada();
      } else if (decodedText.includes("SALIDA") || ticketActivo) {
        simularSalida();
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
  });
}

function stopCamera() {
  if (html5QrCode && cameraActive) {
    html5QrCode.stop().then(() => {
      cameraActive = false;
      const btn = document.getElementById('btnToggleCamera');
      if (btn) btn.innerText = "📷 Encender Cámara";
    }).catch(err => console.error("Error deteniendo cámara:", err));
  }
}

function simularEntrada() {
  ticketActivo = {
    horaEntrada: new Date().toLocaleTimeString(),
    timestampEntrada: Date.now()
  };

  document.getElementById('btnSimularEntrada').classList.add('hidden');
  document.getElementById('btnSimularSalida').classList.remove('hidden');
  document.getElementById('qrInstruction').innerText = "Muestra este QR de SALIDA en la plumilla.";
  // Cambia el QR al formato de salida
  document.getElementById('qrImage').src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PARKTRACK_SALIDA";
  document.getElementById('ticketSalida').classList.add('hidden');

  alert("¡Entrada registrada con éxito en la plumilla! 🚗");
  actualizarUI();
}

function simularSalida() {
  if (!ticketActivo) return;

  const costoSimulado = 40.00;
  
  if (saldo >= costoSimulado) {
    saldo -= costoSimulado;
  } else {
    deuda += (costoSimulado - saldo);
    saldo = 0;
    alert("Saldo insuficiente. Se ha acumulado una deuda pendiente en tu cuenta.");
  }

  // Mostrar Ticket de Salida
  document.getElementById('ticketSalida').classList.remove('hidden');
  document.getElementById('ticketFolio').innerText = `#PT-${Math.floor(Math.random() * 9000 + 1000)}`;
  document.getElementById('ticketCosto').innerText = `$${costoSimulado.toFixed(2)} MXN`;
  document.getElementById('ticketSaldo').innerText = `$${saldo.toFixed(2)} MXN`;

  // Reiniciar estado a Entrada
  ticketActivo = null;
  document.getElementById('btnSimularEntrada').classList.remove('hidden');
  document.getElementById('btnSimularSalida').classList.add('hidden');
  document.getElementById('qrInstruction').innerText = "Escanea el QR de entrada en la plumilla.";
  document.getElementById('qrImage').src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PARKTRACK_ENTRADA";

  actualizarUI();
  alert("¡Salida procesada correctamente! Buen viaje.");
}