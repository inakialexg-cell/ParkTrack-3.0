let html5QrCode = null;
let cameraActive = false;

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
    { fps: 10, qrbox: { width: 200, height: 200 } },
    (decodedText) => {
      alert(`Código QR Detectado: ${decodedText}`);
      if (!ticketActivo) {
        simularEntrada();
      } else {
        simularSalida();
      }
      stopCamera();
    },
    () => {} // Ignorar errores continuos de búsqueda
  ).then(() => {
    cameraActive = true;
    document.getElementById('btnToggleCamera').innerText = "🔴 Apagar Cámara";
  }).catch(err => {
    console.error("Error al iniciar cámara:", err);
    alert("No se pudo acceder a la cámara. Asegúrate de otorgar los permisos necesarios.");
  });
}

function stopCamera() {
  if (html5QrCode && cameraActive) {
    html5QrCode.stop().then(() => {
      cameraActive = false;
      document.getElementById('btnToggleCamera').innerText = "📷 Encender / Apagar Cámara";
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
  document.getElementById('qrInstruction').innerText = "Muestra este QR al salir del recinto.";
  document.getElementById('qrImage').src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ParkTrack-Salida-01";
  document.getElementById('ticketSalida').classList.add('hidden');

  alert("¡Entrada registrada correctamente!");
  actualizarUI();

  // Si la cámara estaba encendida, se reinicia de manera limpia
  if (cameraActive) {
    stopCamera();
    setTimeout(startCamera, 300);
  }
}

function simularSalida() {
  if (!ticketActivo) return;

  const costoSimulado = 40.00;
  
  if (saldo >= costoSimulado) {
    saldo -= costoSimulado;
  } else {
    deuda += (costoSimulado - saldo);
    saldo = 0;
    alert("Saldo insuficiente. Se ha acumulado el saldo pendiente en tu cuenta.");
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
  document.getElementById('qrInstruction').innerText = "Muestra o escanea este código al entrar al recinto.";
  document.getElementById('qrImage').src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ParkTrack-Entrada-01";

  actualizarUI();

  if (cameraActive) {
    stopCamera();
  }
}