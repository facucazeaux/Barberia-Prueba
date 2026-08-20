// =============================================================
// MOCK DATA
// Estructura de datos de ejemplo para simular una barbería real.
// En producción, esto vendría de una API / base de datos (Firebase,
// Supabase, un backend propio, etc). Se mantiene todo en un solo
// archivo para que sea fácil de reemplazar por llamadas reales.
// =============================================================

// ---- SERVICIOS -------------------------------------------------
// duration: minutos que ocupa el turno en la agenda
// price: en la moneda local (se muestra formateado en la UI)
export const SERVICES = [
  {
    id: 'corte',
    name: 'Corte de Cabello',
    description: 'Corte clásico o a la moda, incluye lavado.',
    duration: 30,
    price: 6000,
    icon: 'Scissors',
  },
  {
    id: 'barba',
    name: 'Arreglo de Barba',
    description: 'Perfilado, afeitado a navaja y toalla caliente.',
    duration: 20,
    price: 4500,
    icon: 'Sparkles',
  },
  {
    id: 'combo',
    name: 'Combo Corte + Barba',
    description: 'El paquete completo con descuento incluido.',
    duration: 50,
    price: 9500,
    icon: 'Star',
  },
  {
    id: 'color',
    name: 'Coloración',
    description: 'Color o mechas, incluye tratamiento capilar.',
    duration: 60,
    price: 12000,
    icon: 'Palette',
  },
];

// ---- BARBEROS ---------------------------------------------------
// schedule: horario semanal de atención. "off" = no atiende ese día.
// workingDays: array de índices de día (0=Domingo ... 6=Sábado)
// calendarId: ID del calendario personal de Google Calendar de cada barbero
export const BARBERS = [
  {
    id: 'juan',
    name: 'Juan Pérez',
    role: 'Barbero Senior',
    avatarColor: 'bg-brass-500',
    initials: 'JP',
    serviceIds: ['corte', 'barba', 'combo'],
    calendarId: import.meta.env.VITE_GOOGLE_JUAN_CALENDAR_ID || 'juan.calendar@example.com',
    schedule: {
      1: { start: '09:00', end: '18:00' }, // Lunes
      2: { start: '09:00', end: '18:00' }, // Martes
      3: { start: '09:00', end: '18:00' }, // Miércoles
      4: { start: '09:00', end: '18:00' }, // Jueves
      5: { start: '09:00', end: '20:00' }, // Viernes
      6: { start: '09:00', end: '14:00' }, // Sábado
    },
    blockedDates: [], // fechas completas bloqueadas, formato 'YYYY-MM-DD'
  },
  {
    id: 'martin',
    name: 'Martín Gómez',
    role: 'Barbero & Colorista',
    avatarColor: 'bg-pole-red',
    initials: 'MG',
    serviceIds: ['corte', 'barba', 'combo', 'color'],
    calendarId: import.meta.env.VITE_GOOGLE_MARTIN_CALENDAR_ID || 'martin.calendar@example.com',
    schedule: {
      1: { start: '11:00', end: '19:00' },
      3: { start: '11:00', end: '19:00' },
      4: { start: '11:00', end: '19:00' },
      5: { start: '11:00', end: '19:00' },
      6: { start: '10:00', end: '15:00' },
    },
    blockedDates: [],
  },
  {
    id: 'sofia',
    name: 'Sofía Ruiz',
    role: 'Estilista',
    avatarColor: 'bg-sage-500',
    initials: 'SR',
    serviceIds: ['corte', 'combo', 'color'],
    calendarId: import.meta.env.VITE_GOOGLE_SOFIA_CALENDAR_ID || 'sofia.calendar@example.com',
    schedule: {
      2: { start: '09:00', end: '17:00' },
      3: { start: '09:00', end: '17:00' },
      4: { start: '09:00', end: '17:00' },
      5: { start: '09:00', end: '17:00' },
      6: { start: '09:00', end: '13:00' },
    },
    blockedDates: [],
  },
];

// ---- TURNOS RESERVADOS (mock) -----------------------------------
// Simula turnos ya tomados en la base de datos, para que el selector
// de horarios los muestre como "ocupados" y el AdminDashboard tenga
// contenido de ejemplo para mostrar.
// status: 'confirmed' | 'cancelled'
const todayISO = new Date().toISOString().slice(0, 10);

export let APPOINTMENTS = [
  {
    id: 'apt-1',
    barberId: 'juan',
    serviceId: 'corte',
    date: todayISO,
    time: '10:00',
    clientName: 'Lucas Fernández',
    clientPhone: '+54 9 11 5555-1234',
    clientEmail: 'lucas@email.com',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-2',
    barberId: 'juan',
    serviceId: 'combo',
    date: todayISO,
    time: '11:00',
    clientName: 'Bruno Ledesma',
    clientPhone: '+54 9 11 5555-5678',
    clientEmail: 'bruno@email.com',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-3',
    barberId: 'martin',
    serviceId: 'color',
    date: todayISO,
    time: '14:00',
    clientName: 'Carla Núñez',
    clientPhone: '+54 9 11 5555-9012',
    clientEmail: 'carla@email.com',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];

// Helper para agregar un turno nuevo (simula el POST a una API).
export function addAppointment(appointment) {
  const newAppointment = {
    ...appointment,
    id: `apt-${Date.now()}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  APPOINTMENTS = [...APPOINTMENTS, newAppointment];
  return newAppointment;
}

// Helper para cancelar un turno (simula un PATCH a una API).
export function cancelAppointment(appointmentId) {
  APPOINTMENTS = APPOINTMENTS.map((apt) =>
    apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
  );
}
