function simularEntrada() {
  ticketActivo = {
    horaEntrada: new Date().toLocaleTimeString(),
    timestampEntrada: Date.now()
  };

  document.getElementById('btnSimularEntrada').classList.add('hidden');
  document.getElementById('btnSimularSalida').classList.remove('hidden');
  document.getElementById('qrInstruction').innerText = "Muestra este QR al salir del estacionamiento.";
  document.getElementById('qrImage').src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ParkTrack-Salida-01";
  
  alert("¡Entrada registrada correctamente!");
  actualizarUI();
}

function simularSalida() {
  if (!ticketActivo) return;

  const costoSimulado = 40.00; // Tarifa fija de simulación
  
  if (saldo >= costoSimulado) {
    saldo -= costoSimulado;
  } else {
    deuda += (costoSimulado - saldo);
    saldo = 0;
    alert("Saldo insuficiente. Se ha generado una deuda en tu cuenta.");
  }

  // Mostrar Ticket de Salida
  document.getElementById('ticketSalida').classList.remove('hidden');
  document.getElementById('ticketFolio').innerText = `#PT-${Math.floor(Math.random() * 9000 + 1000)}`;
  document.getElementById('ticketTiempo').innerText = "01 hrs 15 mins";
  document.getElementById('ticketCosto').innerText = `$${costoSimulado.toFixed(2)} MXN`;
  document.getElementById('ticketSaldo').innerText = `$${saldo.toFixed(2)} MXN`;

  // Reiniciar estado
  ticketActivo = null;
  document.getElementById('btnSimularEntrada').classList.remove('hidden');
  document.getElementById('btnSimularSalida').classList.add('hidden');
  document.getElementById('qrInstruction').innerText = "Muestra o escanea este código al entrar al recinto.";
  document.getElementById('qrImage').src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ParkTrack-Entrada-01";

  actualizarUI();
}