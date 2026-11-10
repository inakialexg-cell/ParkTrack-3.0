let html5QrCode = null;

function startScanner() {
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 220, height: 220 } },
    (decodedText) => {
      procesarLecturaQR(decodedText);
      stopScanner();
    },
    (errorMessage) => { /* Escaneando... */ }
  ).catch(err => {
    console.error("Error al iniciar cámara:", err);
  });
}

function stopScanner() {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().then(() => {
      document.getElementById('reader').innerHTML = '';
    });
  }
}

function procesarLecturaQR(data) {
  const resDiv = document.getElementById('qr-result');
  resDiv.classList.remove('hidden');
  
  // Si hay boleto previo, calcula cobro
  const boleto = JSON.parse(localStorage.getItem('boletoActivo'));
  if (boleto) {
    const entrada = new Date(boleto.horaEntrada);
    const ahora = new Date();
    const diffHoras = Math.max(1, Math.ceil((ahora - entrada) / (1000 * 60 * 60)));
    const total = diffHoras * boleto.tarifa;

    resDiv.innerHTML = `
      <p class="font-bold text-green-700">QR Escaneado Correctamente</p>
      <p class="text-xs text-slate-600 mt-1">Folio: ${boleto.folio}</p>
      <p class="text-xs text-slate-600">Tiempo estimado: ${diffHoras} hora(s)</p>
      <p class="text-base font-bold text-parkOrange mt-2">Total a pagar: $${total}.00 MXN</p>
      <button onclick="confirmarPago(${total})" class="mt-3 w-full bg-parkGreen text-white py-2 rounded-lg font-bold text-xs">Pagar con Saldo</button>
    `;
  } else {
    resDiv.innerHTML = `<p class="text-slate-700">Código QR detectado: <b>${data}</b></p>`;
  }
}

function confirmarPago(monto) {
  alert(`Pago de $${monto}.00 MXN realizado con éxito.`);
  localStorage.removeItem('boletoActivo');
  location.reload();
}