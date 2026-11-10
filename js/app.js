// Estado Global
let saldo = 230.00;
let deuda = 0.00;
let ticketActivo = null;

// Cambiar de pestañas
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-brandGreen');
    btn.classList.add('text-slate-400');
  });

  const targetTab = document.getElementById(`tab-${tabId}`);
  const targetBtn = document.getElementById(`btn-${tabId}`);

  if (targetTab) targetTab.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.remove('text-slate-400');
    targetBtn.classList.add('text-brandGreen');
  }

  if (tabId === 'recintos' && typeof initMap === 'function') {
    setTimeout(initMap, 200);
  }
}

// Actualizar Saldo en Pantalla
function actualizarUI() {
  document.getElementById('saldoHeader').innerText = `$${saldo.toFixed(2)} MXN`;
  const alertaDeuda = document.getElementById('alertaDeuda');
  if (deuda > 0) {
    alertaDeuda.classList.remove('hidden');
    document.getElementById('montoDeuda').innerText = `$${deuda.toFixed(2)} MXN`;
  } else {
    alertaDeuda.classList.add('hidden');
  }
  renderHistorial();
}

// Simular Recarga
function recargarSaldo() {
  const montoInput = document.getElementById('montoRecarga');
  const monto = parseFloat(montoInput.value);
  if (isNaN(monto) || monto <= 0) {
    alert("Ingresa un monto válido");
    return;
  }

  saldo += monto;
  if (deuda > 0) {
    if (saldo >= deuda) {
      saldo -= deuda;
      deuda = 0;
      alert("¡Deuda saldada con éxito!");
    } else {
      deuda -= saldo;
      saldo = 0;
    }
  }

  montoInput.value = '';
  actualizarUI();
  alert(`Recarga exitosa. Tu nuevo saldo es $${saldo.toFixed(2)} MXN`);
}

// Historial de Boletos
function renderHistorial() {
  const container = document.getElementById('listaBoletos');
  if (!ticketActivo) {
    container.innerHTML = `
      <div class="bg-brandCard p-4 rounded-xl border border-slate-800 text-xs text-slate-400 text-center">
        No tienes boletos activos en este momento.
      </div>`;
  } else {
    container.innerHTML = `
      <div class="bg-brandCard p-4 rounded-xl border border-brandGreen text-xs space-y-1">
        <div class="flex justify-between font-bold text-white">
          <span>Estacionamiento Activo (#PT-882)</span>
          <span class="text-brandGreen">EN CURSO</span>
        </div>
        <p class="text-slate-400">Entrada: ${ticketActivo.horaEntrada}</p>
      </div>`;
  }
}

function cerrarSesion() {
  alert("Sesión cerrada correctamente.");
}

document.addEventListener('DOMContentLoaded', actualizarUI);