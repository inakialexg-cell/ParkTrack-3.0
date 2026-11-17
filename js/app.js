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

// 2. INICIO DE SESIÓN REAL CON SUPABASE AUTH Y CARGA DE PERFIL
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
  
  // Cargar datos reales vinculados en Supabase (Saldo y Tarjeta)
  await cargarDatosPerfilSupabase();

  // Inicializar el cálculo horario de los recintos de Monterrey
  if (typeof calcularDisponibilidadPorHora === 'function') {
    calcularDisponibilidadPorHora();
  }
}

// 3. CARGAR DATOS DEL PERFIL DESDE SUPABASE
async function cargarDatosPerfilSupabase() {
  const { data: { user } } = await _supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await _supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (data) {
    saldo = data.saldo !== null ? parseFloat(data.saldo) : 0.00;
    if (data.tarjeta_ultimos_digitos) {
      tarjetaRegistrada = `Visa/Mastercard •••• ${data.tarjeta_ultimos_digitos}`;
    } else {
      tarjetaRegistrada = null;
    }
    actualizarUI();
    actualizarUIPerfil();
  }
}

// 4. GESTIÓN DE TARJETA DE CRÉDITO (Vinculada a Supabase)
async function registrarTarjeta() {
  const numInput = document.getElementById('inputNumTarjeta').value.trim();
  if (!numInput || numInput.length < 4) {
    alert("Ingresa un número de tarjeta válido.");
    return;
  }

  const ultimosDigitos = numInput.slice(-4);
  const { data: { user } } = await _supabase.auth.getUser();

  if (user) {
    const { error } = await _supabase
      .from('perfiles')
      .update({ tarjeta_ultimos_digitos: ultimosDigitos })
      .eq('id', user.id);

    if (error) {
      alert("Error al guardar la tarjeta en la base de datos: " + error.message);
      return;
    }
  }

  tarjetaRegistrada = `Visa/Mastercard •••• ${ultimosDigitos}`;
  actualizarUIPerfil();
  alert("¡Tarjeta de crédito vinculada y guardada en Supabase con éxito!");
}

async function eliminarTarjeta() {
  if (confirm("¿Estás seguro de eliminar tu tarjeta? Recuerda que es obligatoria para salir de los recintos.")) {
    const { data: { user } } = await _supabase.auth.getUser();

    if (user) {
      await _supabase
        .from('perfiles')
        .update({ tarjeta_ultimos_digitos: null })
        .eq('id', user.id);
    }

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

  if (!badge || !infoContainer) return;

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

// 5. CONTROL DE VISTAS AUTH
function showAuthView(viewName) {
  document.getElementById('viewBienvenida').classList.add('hidden');
  document.getElementById('viewLogin').classList.add('hidden');
  document.getElementById('viewRegister').classList.add('hidden');

  if (viewName === 'bienvenida') document.getElementById('viewBienvenida').classList.remove('hidden');
  if (viewName === 'login') document.getElementById('viewLogin').classList.remove('hidden');
  if (viewName === 'register') document.getElementById('viewRegister').classList.remove('hidden');
}

// 6. ACTUALIZAR PANTALLA DE PASE QR (Burbuja exclusiva de reservación)
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
    qrInst.innerHTML = `
      <div class="bg-gradient-to-r from-blue-900/40 to-brandBlue/20 border-2 border-brandBlue p-3.5 rounded-2xl mb-3 shadow-lg text-left space-y-1">
        <div class="flex justify-between items-center">
          <span class="bg-brandBlue text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">🅿️ Reservación Exclusiva</span>
          <span class="text-xs text-brandBlue font-bold">${reservaActiva.folio}</span>
        </div>
        <p class="text-sm font-bold text-white pt-1">${reservaActiva.recintoNombre}</p>
        <p class="text-[11px] text-slate-300">Cajón apartado con anticipación. Tarifa: $${reservaActiva.tarifa}/hr</p>
      </div>
      <span class="text-brandGreen font-bold text-xs block text-center">📱 Escanea este código al llegar para validar tu acceso reservado.</span>
    `;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=ENTRADA-${reservaActiva.folio}-${reservaActiva.recintoId}`;
    if (btnEntrada) {
      btnEntrada.innerText = `Registrar Entrada (Llegué al Recinto) 🚗`;
      btnEntrada.classList.remove('hidden');
    }
    if (btnSalida) btnSalida.classList.add('hidden');
  } else if (reservaActiva.estado === 'DENTRO') {
    qrInst.innerHTML = `
      <div class="bg-gradient-to-r from-amber-900/40 to-amber-600/20 border-2 border-amber-500 p-3.5 rounded-2xl mb-3 shadow-lg text-left space-y-1">
        <div class="flex justify-between items-center">
          <span class="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">🚗 Estancia en Curso</span>
          <span class="text-xs text-amber-400 font-bold">${reservaActiva.folio}</span>
        </div>
        <p class="text-sm font-bold text-white pt-1">${reservaActiva.recintoNombre}</p>
        <p class="text-[11px] text-slate-300">Entrada registrada a las: ${reservaActiva.horaEntrada}</p>
      </div>
      <span class="text-amber-400 font-bold text-xs block text-center">🏁 Escanea este segundo código al salir para calcular tu cobro.</span>
    `;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=SALIDA-${reservaActiva.folio}-${reservaActiva.recintoId}`;
    if (btnEntrada) btnEntrada.classList.add('hidden');
    if (btnSalida) {
      btnSalida.innerText = `Registrar Salida y Pagar 💳`;
      btnSalida.classList.remove('hidden');
    }
  }
}

// 7. NAVEGACIÓN DE PESTAÑAS
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
  const elementoSaldo = document.getElementById('saldoHeader');
  if (elementoSaldo) elementoSaldo.innerText = `$${saldo.toFixed(2)} MXN`;
  
  const alertaDeuda = document.getElementById('alertaDeuda');
  if (alertaDeuda) {
    if (deuda > 0) {
      alertaDeuda.classList.remove('hidden');
      document.getElementById('montoDeuda').innerText = `$${deuda.toFixed(2)} MXN`;
    } else {
      alertaDeuda.classList.add('hidden');
    }
  }
  renderHistorial();
}

// 8. RECARGAR SALDO (Sincronizado con Supabase)
async function recargarSaldo() {
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

  const { data: { user } } = await _supabase.auth.getUser();
  if (user) {
    const { error } = await _supabase
      .from('perfiles')
      .update({ saldo: saldo })
      .eq('id', user.id);

    if (error) {
      alert("Error al actualizar el saldo en la base de datos.");
      return;
    }
  }

  montoInput.value = '';
  actualizarUI();
  alert(`Recarga realizada y guardada. Saldo actual: $${saldo.toFixed(2)} MXN`);
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
// 9. INTEGRACIÓN CON RECINTOS (Al final de tu app.js)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof calcularDisponibilidadPorHora === 'function') {
    calcularDisponibilidadPorHora();
  }
});