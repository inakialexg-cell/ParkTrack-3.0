# ParkTrack

Aplicación web de enfoque móvil para la consulta de disponibilidad de estacionamientos, apartado de cajones, acceso mediante códigos QR, monedero digital y visualización geográfica en el área metropolitana de Monterrey[cite: 1, 2, 3, 4, 6].

---

## 1. Descripción general del proyecto

**ParkTrack** permite a los usuarios consultar la disponibilidad de estacionamientos en recintos de Monterrey y su zona metropolitana (como *Parque Fundidora*, *Estadio Mobil Super*, *Paseo La Fe*, *Estadio Universitario* y *Galerías Monterrey*), simular horarios para observar cambios de ocupación, apartar cajones y gestionar entradas, salidas y cobros[cite: 1, 3, 4].

El sistema cuenta con dos modalidades principales de acceso mediante QR:
* **Boleto de entrada general (paso rápido):** Permite generar un boleto de acceso directo, registrar o simular la salida en la plumilla y aplicar el cobro correspondiente[cite: 2, 6].
* **Reservación activa (*Reservación Arcoíris*):** Se activa al apartar previamente un cajón desde un recinto, descontando un espacio disponible y mostrando un código QR vinculado al folio y tarifa del apartado[cite: 2, 6].

---

## 2. Tecnologías y dependencias utilizadas

* **Frontend:** HTML5, CSS3 (`css/styles.css`) y JavaScript (ES6+) con diseño adaptable para dispositivos móviles.
* **Backend / Base de datos y autenticación:** **Supabase** (autenticación de usuarios y tabla `perfiles` para datos de perfil, saldo y tarjeta registrada).
* **Mapas interactivos:** **Leaflet** y capas de mosaicos de **OpenStreetMap** (`tile.openstreetmap.org`) para mostrar marcadores de colores y ventanas emergentes sincronizadas con la disponibilidad[cite: 2, 4, 6].
* **Códigos QR y escaneo:** **QR Server API** (`api.qrserver.com/v1/create-qr-code/`) para generar códigos QR de entrada, reservación y salida, junto con **html5-qrcode** para lectura mediante cámara[cite: 2, 6].
* **Control de versiones y despliegue:** **Git** y **Vercel**.

---

## 3. Requisitos de instalación

* Navegador web moderno (Chrome, Edge, Firefox o Safari en escritorio o móvil) con soporte para JavaScript y acceso a cámara (opcional, para escaneo QR en vivo).
* Conexión a internet para cargar las librerías externas, los mosaicos del mapa de OpenStreetMap, la generación de imágenes QR y la conexión con Supabase[cite: 2, 6].
* Cuenta y proyecto configurado en **Supabase** con la tabla `perfiles` habilitada.
* **Git** instalado (y opcionalmente un servidor local estático como *Live Server* en Visual Studio Code o Node.js) para clonar y servir los archivos.

---

## 4. Instrucciones para configurar y ejecutar el sistema

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd <CARPETA_DEL_PROYECTO>

Estructura general del proyecto
├── index.html          # Estructura principal de vistas y navegación de la app
├── css/
│   └── styles.css      # Estilos del tema oscuro, diseño móvil y scroll vertical
├── js/
│   ├── app.js          # Lógica principal, autenticación, saldo, historial y navegación
│   ├── recintos.js     # Catálogo de recintos, simulación horaria (-1h/+1h) y apartados
│   ├── scanner.js      # Flujo de QR general, Reservación Arcoíris, cobros y cámara
│   └── map.js          # Inicialización y actualización de marcadores en Leaflet
└── README.md           # Documentación técnica del proyecto

Limitaciones o consideraciones técnicas relevantesSimulación de ocupación y cobros: La ocupación por hora en los recintos se calcula mediante reglas y variaciones simuladas según el horario y tipo de recinto, y los cobros de salida se simulan sobre el saldo/tarjeta del perfil sin integración con una pasarela bancaria real ni hardware de plumillas físicas.   Persistencia híbrida: El saldo del perfil se sincroniza con Supabase[cite: 1, 2], mientras que ciertos registros o estados de sesión/historial pueden apoyarse en memoria del navegador o localStorage, por lo que conviene verificar la conexión y los permisos de base de datos al cambiar de dispositivo o sesión.Dependencia de servicios externos: La carga del mapa (OpenStreetMap), la generación de imágenes QR (QR Server) y la autenticación/base de datos (Supabase) requieren conectividad activa y disponibilidad de dichos servicios externos.   Permisos de cámara en móvil: El escaneo por cámara (html5-qrcode) requiere permisos otorgados por el navegador y un contexto seguro (HTTPS, como en despliegues en Vercel).

