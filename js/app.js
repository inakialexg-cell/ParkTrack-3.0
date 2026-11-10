// Estado Global
let usuarioActual = {
  nombre: "Juan Pérez",
  email: "usuario@parktrack.com",
  password: "123"
};

let saldo = 230.00;
let deuda = 0.00;
let ticketActivo = null;

// Lógica de Autenticación
function showAuthView(viewName) {
  document.getElementById('viewBienvenida').classList.add('hidden');
  document.getElementById('viewLogin').classList.add('hidden');
  document.getElementById('viewRegister').classList.add('hidden');

  if (viewName === 'bienvenida') document.getElementById('viewBienvenida').classList.remove('hidden');
  if (viewName === 'login') document.getElementById('viewLogin').classList.remove('hidden');
  if (viewName === 'register') document.getElementById('viewRegister').classList.remove('hidden');
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const pass = document.getElementById('regPassword').value;
  const confirmPass = document.getElementById('regConfirmPassword').value;

  if (pass !== confirmPass) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  usuarioActual = { nombre: name, email: email, password: pass };
  alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
  showAuthView('login');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPassword').value;

  if (email === usuarioActual.email && pass === usuarioActual.password) {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    
    // Actualizar datos del perfil
    const initials = usuarioActual.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('profileAvatar').innerText = initials || 'PT';
    document.getElementById('profileName').innerText = usuarioActual.nombre;
    document.getElementById('profileEmail').innerText = usuarioActual.email;
    document.getElementById('headerUsuarioNombre').innerText = usuarioActual.nombre;
    document.getElementById('welcomeUserName').innerText = usuarioActual.nombre.split(' ')[0];

    actualizarUI();
  } else {
    alert("Correo o contraseña incorrectos.");
  }
}

function cerrarSesion() {
  if (typeof stopCamera === 'function') stopCamera();
  document.getElementById('appContainer').classList.add('hidden');
  document.getElementById('authContainer').classList.remove('hidden');
  showAuthView('bienvenida');
}

// Navegación Pestañas
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

  if (tabId !== 'escaneo' && typeof stopCamera === 'function') {
    stopCamera();
  }
}

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