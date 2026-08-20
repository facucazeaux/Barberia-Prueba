# Turnos Barbería 💈

Sistema de turnos online para barberías / peluquerías. Reserva sin login
para el cliente + panel de administración para el dueño/barbero.
Sin pasarela de pagos (por diseño, en esta versión).

## Stack

- React 18 (JSX) + Vite
- Tailwind CSS
- lucide-react (íconos)

Todos los datos son **mock** (`src/data/mockData.js`), pensados para
reemplazarse fácilmente por llamadas a una API real (Firebase, Supabase,
un backend propio, etc).

## Instalación

```bash
npm install
npm run dev
```

- Vista del cliente (pública): `http://localhost:5173/`
- Panel del dueño (privado, con PIN): `http://localhost:5173/admin`

## Acceso al panel admin (sin que el cliente lo vea ni lo encuentre)

La vista de cliente **no tiene ningún botón ni link** hacia el panel
admin: viven en URLs distintas y solo el dueño conoce `/admin`.

1. **PIN de acceso**: al entrar a `/admin` pide un PIN de 4 dígitos
   (por defecto `2024`, cambialo en `src/components/admin/AdminLogin.jsx`,
   constante `ADMIN_PIN`). Una vez ingresado, la sesión queda recordada
   en ese dispositivo por 12hs, así el dueño no lo vuelve a tipear
   turno tras turno.
2. **"Como si fueran dos apps"**: una vez desplegada la web (ver abajo),
   el dueño entra una única vez a `.../admin` desde el navegador de su
   celular y usa la opción **"Agregar a pantalla de inicio"** (Chrome
   Android) o **"Compartir → Agregar a pantalla de inicio"** (Safari
   iOS). Le queda un ícono propio en el celular que abre directo el
   panel, a pantalla completa y sin barra de navegador — para él es,
   en la práctica, una app aparte de la que usan sus clientes.

> Nota de seguridad: el PIN vive en el código del frontend, así que es
> una barrera simple (evita que un cliente curioso entre por error o
> adivinando la URL), no un sistema de autenticación robusto. Si más
> adelante conectás un backend real, lo ideal es mover esta validación
> ahí (o usar Firebase Auth / Supabase Auth).

## Desplegar (para que `/admin` funcione al refrescar la página)

Como es una Single Page App, el servidor debe redirigir *todas* las
rutas a `index.html` para que `/admin` no dé error 404 al refrescar:

- **Netlify**: ya incluido en `public/_redirects`.
- **Vercel**: ya incluido en `vercel.json`.
- Otro hosting: buscar "SPA fallback" o "rewrite to index.html" en su documentación.

## Estructura del proyecto

```
src/
├── data/
│   └── mockData.js          # Barberos, servicios y turnos de ejemplo
├── utils/
│   ├── calendar.js          # Google Calendar URL + generación/descarga .ics
│   └── scheduling.js        # Cálculo de horarios disponibles
├── components/
│   ├── shared/
│   │   ├── Button.jsx
│   │   └── Card.jsx
│   ├── CalendarSyncButtons.jsx   # Botones "Agregar a calendario"
│   ├── booking/
│   │   ├── BookingFlow.jsx       # Orquestador del flujo del cliente
│   │   ├── StepIndicator.jsx
│   │   └── steps/
│   │       ├── ServiceStep.jsx
│   │       ├── BarberStep.jsx
│   │       ├── DateTimeStep.jsx
│   │       ├── ClientFormStep.jsx
│   │       └── ConfirmationStep.jsx
│   └── admin/
│       ├── AdminDashboard.jsx    # Orquestador del panel del dueño
│       ├── AgendaView.jsx        # Agenda del día/semana + exportar .ics
│       ├── BlockScheduleModal.jsx
│       └── ScheduleConfig.jsx
├── App.jsx                  # Toggle Vista Cliente / Vista Admin
├── main.jsx
└── index.css
```

## Flujo del cliente (sin login)

1. **Servicio** — elige entre los servicios ofrecidos.
2. **Profesional** — solo se muestran los barberos que ofrecen ese servicio.
3. **Fecha y hora** — carrusel de días + grilla de horarios realmente
   disponibles (cruza horario del barbero, turnos ya tomados y bloqueos).
4. **Datos** — nombre + WhatsApp (lo mínimo indispensable).
5. **Confirmación** — resumen del turno + botones para agregarlo a
   Google Calendar o descargar un archivo `.ics`.

## Panel del dueño/barbero

- **Agenda**: turnos del día (navegable a 7 días), con opción de
  cancelar cada turno y de exportar toda la semana a un `.ics` para
  importarla en su calendario personal.
- **Bloquear**: bloquear un día completo o un horario puntual para un
  barbero específico (vacaciones, turno médico, almuerzo, etc).
- **Horarios**: configurar, por barbero, qué días atiende y en qué
  rango horario, con un simple switch por día.

## Próximos pasos sugeridos (fuera de este alcance)

- Reemplazar `mockData.js` por una API real y persistencia en base de datos.
- Autenticación para el panel admin.
- Notificaciones por WhatsApp/SMS de confirmación y recordatorio.
- Pasarela de pagos / seña online (explícitamente fuera de este alcance).
