// Inicializar cliente de Supabase
const supabaseUrl = 'https://jdxtprrjazudmnhljuzw.supabase.co';
const supabaseKey = 'sb_publishable_xVr79C5kb7yL8ZtToKAUsg_gRxhXPt4'; // Pegar la Publishable Key de Supabase
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Estado Global con Saldo en 0.00 al registrarse
let saldo = 0.00;
let deuda = 0.00;
let ticketActivo = null;
let tarjetaRegistrada = null; // Guardará la info de la tarjeta activa

// Registro de Usuario vinculado a Supabase
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

  // Insertar datos en la tabla 'usuarios' de Supabase
  const { data, error } = await _supabase
    .from('usuarios')
    .insert([{ nombre: name, email: email, password: pass }]);

  if (error) {
    console.error("Error al registrar en Supabase:", error.message);
    alert("Hubo un error al conectar con la base de datos.");
    return;
  }

  alert("¡Cuenta registrada y guardada en Supabase con éxito!");
  e.target.reset();
  showAuthView('login');


  usuarioActual = { nombre: name, email: email, password: pass };
  saldo = 0.00; // Saldo inicial en cero como se solicitó
  tarjetaRegistrada = null;

  alert("¡Cuenta creada con éxito! Comienzas con un saldo de $0.00 MXN. Inicia sesión para vincular tu tarjeta.");
  e.target.reset();
  showAuthView('login');
}

// Funciones de Gestión de Tarjeta de Crédito
function registrarTarjeta() {
  const numInput = document.getElementById('inputNumTarjeta').value.trim();
  if (!numInput || numInput.length < 4) {
    alert("Ingresa un número de tarjeta válido.");
    return;
  }

  // Tomar los últimos 4 dígitos por seguridad visual
  const ultimosDigitos = numInput.slice(-4);
  tarjetaRegistrada = `Visa/Mastercard •••• ${ultimosDigitos}`;

  actualizarUIPerfil();
  alert("¡Tarjeta de crédito vinculada con éxito!");
}

function eliminarTarjeta() {
  if (confirm("¿Estás seguro de eliminar tu tarjeta? Recuerda que no podrás realizar cargos ni salir de los recintos sin una tarjeta activa.")) {
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

// Control de vistas Auth
function showAuthView(viewName) {
  document.getElementById('viewBienvenida').classList.add('hidden');
  document.getElementById('viewLogin').classList.add('hidden');
  document.getElementById('viewRegister').classList.add('hidden');

  if (viewName === 'bienvenida') document.getElementById('viewBienvenida').classList.remove('hidden');
  if (viewName === 'login') document.getElementById('viewLogin').classList.remove('hidden');
  if (viewName === 'register') document.getElementById('viewRegister').classList.remove('hidden');
}

// Registro de Usuario
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

  // Actualizar el usuario actual con los datos ingresados
  usuarioActual = { 
    nombre: name, 
    email: email, 
    password: pass 
  };

  alert("¡Cuenta registrada con éxito! Por favor, inicia sesión con tus datos.");
  
  // Limpiar formulario y regresar al login
  e.target.reset();
  showAuthView('login');
}

// Registro real con Supabase Auth (crea el usuario y activa el trigger del perfil)
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

  // Llamada a Supabase Auth
  const { data, error } = await _supabase.auth.signUp({
    email: email,
    password: pass,
    options: {
      data: { nombre: name } // Esto lo lee el Trigger SQL para el nombre y saldo en 0
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

// Inicio de sesión real con Supabase Auth
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

  // Si el login es exitoso, pasamos a la app principal
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