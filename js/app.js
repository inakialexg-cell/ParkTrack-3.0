// Inicializar cliente de Supabase
const supabaseUrl = 'https://jdxtprrjazudmnhljuzw.supabase.co';
const supabaseKey = 'sb_publishable_xVr79C5kb7yL8ZtToKAUsg_gRxhXPt4';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Estado Global con Saldo en 0.00 al registrarse
let saldo = 0.00;
let deuda = 0.00;
let ticketActivo = null;
let tarjetaRegistrada = null; // Guardará la info de la tarjeta activa

// 1. REGISTRO REAL CON SUPABASE AUTH (Única versión limpia)
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

  // Llamada oficial a Supabase Auth
  const { data, error } = await _supabase.auth.signUp({
    email: email,
    password: pass,
    options: {
      data: { nombre: name } // El Trigger SQL lee esto para el nombre y saldo inicial en 0
    }
  });

  if (error) {
    alert("Error al registrarse: " + error.message);
    return;
  }

  alert("¡Cuenta registrada con éxito en Supabase! Ya puedes iniciar sesión.");
  e.target.reset();
  showAuthView('login');
}

// 2. INICIO DE SESIÓN REAL CON SUPABASE AUTH
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPassword').value;

  const { data, error } = await _supabase.auth.signInWithPassword({
    email: email,
    password: pass
  });

  if (error) {
    alert("Correo o contraseña incorrectos: " + error.message);
    return;
  }

  // Si el login es exitoso, ocultamos auth y abrimos la app principal
  document.getElementById('authContainer').classList.add('hidden');
  document.getElementById('appContainer').classList.remove('hidden');

  // Obtener datos del perfil del usuario logueado
  const user = data.user;
  const nombreUsuario = user.user_metadata?.nombre || "Usuario";

  document.getElementById('profileName').innerText = nombreUsuario;
  document.getElementById('profileEmail').innerText = user.email;
  document.getElementById('headerUsuarioNombre').innerText = nombreUsuario;
  document.getElementById('welcomeUserName').innerText = nombreUsuario.split(' ')[0];

  actualizarUI();

  // Inicializar el cálculo horario de los recintos de Monterrey
  if (typeof calcularDisponibilidadPorHora === 'function') {
    calcularDisponibilidadPorHora();
  }
}

// 3. GESTIÓN DE TARJETA DE CRÉDITO
function registrarTarjeta() {
  const numInput = document.getElementById('inputNumTarjeta').value.trim();
  if (!numInput || numInput.length < 4) {
    alert("Ingresa un número de tarjeta válido.");
    return;
  }

  const ultimosDigitos = numInput.slice(-4);
  tarjetaRegistrada = `Visa/Mastercard •••• ${ultimosDigitos}`;

  actualizarUIPerfil();
  alert("¡Tarjeta de crédito vinculada con éxito!");
}

function eliminarTarjeta() {
  if (confirm("¿Estás seguro de eliminar tu tarjeta? Recuerda que es obligatoria para salir de los recintos.")) {
    tarjetaRegistrada = null;
    actualizarUIPerfil();
    alert("Tarjeta eliminada correctamente.");
  }
}

function actualizarUIPerfil() {
  const badge = document.getElementById('estadoTarjetaBadge');
  const infoContainer = document.getElementById('tarjetaInfoContainer');
  const formCard = document.getElementById('formAgregarTarjeta');
  const btnDelete = document.getElementById('btnEliminarTarjeta');

  if (tarjetaRegistrada) {
    badge.innerText = "ACTIVA";
    badge.className = "text-[10px] bg-emerald-500/20 text-brandGreen px-2 py-0.5 rounded-full font-bold";
    infoContainer.innerHTML = `💳 ${tarjetaRegistrada} <br><span class="text-brandGreen font-semibold">Lista para cobros automáticos</span>`;
    formCard.classList.add('hidden');
    btnDelete.classList.remove('hidden');
  } else {
    badge.innerText = "NO REGISTRADA";
    badge.className = "text-[10px] bg-red-500/20 text-brandRed px-2 py-0.5 rounded-full font-bold";
    infoContainer.innerHTML = `No tienes ninguna tarjeta vinculada. Es obligatoria para realizar cobros de estacionamiento.`;
    formCard.classList.remove('hidden');
    btnDelete.classList.add('hidden');
    document.getElementById('inputNumTarjeta').value = '';
  }
}

// 4. CONTROL DE VISTAS AUTH
function showAuthView(viewName) {
  document.getElementById('viewBienvenida').classList.add('hidden');
  document.getElementById('viewLogin').classList.add('hidden');
  document.getElementById('viewRegister').classList.add('hidden');

  if (viewName === 'bienvenida') document.getElementById('viewBienvenida').classList.remove('hidden');
  if (viewName === 'login') document.getElementById('viewLogin').classList.remove('hidden');
  if (viewName === 'register') document.getElementById('viewRegister').classList.remove('hidden');
}

// Actualizar la pantalla de Pase QR con la burbuja del lugar apartado
function actualizarVistaQR() {
  const qrImg = document.getElementById('qrImage');
  const qrInst = document.getElementById('qrInstruction');
  const btnEntrada = document.getElementById('btnSimularEntrada');
  const btnSalida = document.getElementById('btnSimularSalida');

  if (!qrImg || !qrInst) return;

  if (!reservaActiva) {
    qrInst.innerHTML = "No tienes ningún lugar apartado actualmente.<br><span class='text-slate-400 text-[11px]'>Ve a la sección de Recintos para reservar un cajón.</span>";
    qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=ParkTrack-General";
    if (btnEntrada) btnEntrada.classList.add('hidden');
    if (btnSalida) btnSalida.classList.add('hidden');
    return;
  }

  if (reservaActiva.estado === 'RESERVADO') {
    // BURBUJA / QR 1: ENTRADA AL RECINTO APARTADO
    qrInst.innerHTML = `
      <div class="bg-brandBlue/10 border border-brandBlue/30 p-2.5 rounded-xl mb-2 text-center">
        <span class="text-brandBlue font-bold text-xs">🅿️ LUGAR APARTADO</span><br>
        <span class="text-white font-semibold text-xs">${reservaActiva.recintoNombre}</span><br>
        <span class="text-[10px] text-slate-400">Folio: ${reservaActiva.folio}</span>
      </div>
      <span class="text-brandGreen font-bold text-xs">Escanea este código al LLEGAR para registrar tu ENTRADA.</span>
    `;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=ENTRADA-${reservaActiva.folio}-${reservaActiva.recintoId}`;
    if (btnEntrada) {
      btnEntrada.innerText = `Simular Llegada / ENTRADA 🚗`;
      btnEntrada.classList.remove('hidden');
    }
    if (btnSalida) btnSalida.classList.add('hidden');
  } else if (reservaActiva.estado === 'DENTRO') {
    // BURBUJA / QR 2: SALIDA Y COBRO AUTOMÁTICO
    qrInst.innerHTML = `
      <div class="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl mb-2 text-center">
        <span class="text-amber-400 font-bold text-xs">🚗 ESTANCIA ACTIVA</span><br>
        <span class="text-white font-semibold text-xs">${reservaActiva.recintoNombre}</span><br>
        <span class="text-[10px] text-slate-400">Entrada: ${reservaActiva.horaEntrada}</span>
      </div>
      <span class="text-amber-400 font-bold text-xs">Escanea este segundo código al SALIR para procesar el cobro.</span>
    `;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=SALIDA-${reservaActiva.folio}-${reservaActiva.recintoId}`;
    if (btnEntrada) btnEntrada.classList.add('hidden');
    if (btnSalida) {
      btnSalida.innerText = `Simular SALIDA y Pagar 🏁`;
      btnSalida.classList.remove('hidden');
    }
  }
}
// 5. NAVEGACIÓN DE PESTAÑAS
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

// ==========================================
// 6. INTEGRACIÓN CON RECINTOS (Al final de tu app.js)
// ==========================================
// Llamada inicial segura por si el script recintos.js ya cargó
document.addEventListener("DOMContentLoaded", () => {
  if (typeof calcularDisponibilidadPorHora === 'function') {
    calcularDisponibilidadPorHora();
  }
});