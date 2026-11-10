// Inicializar cliente de Supabase
const supabaseUrl = 'https://jdxtprrjazudmnhljuzw.supabase.co';
const supabaseKey = 'sb_publishable_xVr79C5kb7yL8ZtToKAUsg_gRxhXPt4'; // Pegar la Publishable Key de Supabase
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Estado Global de la App
let usuarioActual = {
  nombre: "Juan Pérez",
  email: "usuario@parktrack.com",
  password: "123"
};

let saldo = 230.00;
let deuda = 0.00;
let ticketActivo = null;

// Control de vistas Auth
function showAuthView(viewName) {
  document.getElementById('viewBienvenida').classList.add('hidden');
  document.getElementById('viewLogin').classList.add('hidden');
  document.getElementById('viewRegister').classList.add('hidden');

  if (viewName === 'bienvenida') document.getElementById('viewBienvenida').classList.remove('hidden');
  if (viewName === 'login') document.getElementById('viewLogin').classList.remove('hidden');
  if (viewName === 'register') document.getElementById('viewRegister').classList.remove('hidden');
}

// Registro e Inicio de Sesión
async function handleRegister(e) {
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

  // Guardar usuario localmente y notificar
  alert("¡Cuenta registrada exitosamente!");
  showAuthView('login');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPassword').value;

  if (email === usuarioActual.email && pass === usuarioActual.password) {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');

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

// Navegación de pestañas
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

  if (tabId === 'escaneo' && typeof initScannerSection === 'function') {
    setTimeout(initScannerSection, 300);
  } else if (typeof stopCamera === 'function') {
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
    alert("Ingresa un monto válido.");
    return;
  }

  saldo += monto;
  if (deuda > 0) {
    if (saldo >= deuda) {
      saldo -= deuda;
      deuda = 0;
      alert("¡Deuda saldada!");
    } else {
      deuda -= saldo;
      saldo = 0;
    }
  }

  montoInput.value = '';
  actualizarUI();
  alert(`Recarga realizada. Saldo actual: $${saldo.toFixed(2)} MXN`);
}

function renderHistorial() {
  const container = document.getElementById('listaBoletos');
  if (!container) return;

  let html = "";

  if (ticketActivo) {
    html += `
      <div class="bg-brandCard p-4 rounded-xl border border-brandGreen text-xs space-y-1 mb-3">
        <div class="flex justify-between font-bold text-white">
          <span>Estacionamiento Activo (${ticketActivo.folio})</span>
          <span class="text-brandGreen">EN CURSO</span>
        </div>
        <p class="text-slate-400">Entrada registrada: ${ticketActivo.horaEntrada}</p>
      </div>`;
  }

  if (window.historialBoletos && window.historialBoletos.length > 0) {
    window.historialBoletos.forEach(b => {
      html += `
        <div class="bg-brandCard p-4 rounded-xl border border-slate-800 text-xs space-y-1">
          <div class="flex justify-between font-bold text-white">
            <span>Boleto ${b.folio}</span>
            <span class="text-brandBlue">$${b.costo.toFixed(2)} MXN</span>
          </div>
          <p class="text-slate-400">Entrada: ${b.entrada} | Salida: ${b.salida}</p>
          <span class="text-[10px] bg-brandGreen/20 text-brandGreen font-bold px-2 py-0.5 rounded-full inline-block">COMPLETADO</span>
        </div>`;
    });
  } else if (!ticketActivo) {
    html += `
      <div class="bg-brandCard p-4 rounded-xl border border-slate-800 text-xs text-slate-400 text-center py-6">
        No tienes registros en tu historial.
      </div>`;
  }

  container.innerHTML = html;
}