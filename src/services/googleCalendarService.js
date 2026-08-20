/**
 * Google Calendar Service
 * -----------------------
 * Servicio para sincronizar turnos con Google Calendar.
 * 
 * Lógica de calendarIds:
 * - Admin: Todos los turnos se sincronizan con el calendario central de la barbería
 * - Barberos: Cada turno se sincroniza con el calendario personal del barbero correspondiente
 * 
 * Variables de entorno requeridas:
 * - VITE_GOOGLE_ADMIN_CALENDAR_ID: ID del calendario central de la barbería
 * - VITE_GOOGLE_JUAN_CALENDAR_ID: ID del calendario personal de Juan
 * - VITE_GOOGLE_MARTIN_CALENDAR_ID: ID del calendario personal de Martín
 * - VITE_GOOGLE_SOFIA_CALENDAR_ID: ID del calendario personal de Sofía
 * - VITE_GOOGLE_API_KEY: API key de Google Calendar API (opcional para algunos métodos)
 */

import { getStartEndDates, formatDateForCalendar } from '../utils/calendar.js';

// Calendar ID central del admin (todos los turnos van aquí)
const ADMIN_CALENDAR_ID = import.meta.env.VITE_GOOGLE_ADMIN_CALENDAR_ID || 'primary';

/**
 * Formatea el título del evento según el contexto (admin vs barbero)
 * @param {Object} bookingData - Datos del turno
 * @param {string} context - 'admin' | 'barber'
 * @returns {string} Título formateado
 */
function formatEventTitle(bookingData, context = 'barber') {
  const { service, clientName, barber } = bookingData;
  
  if (context === 'admin') {
    // Para admin: [Servicio] - [Nombre Cliente] (Barbero: [Nombre Barbero])
    return `${service.name} - ${clientName} (Barbero: ${barber.name})`;
  } else {
    // Para barbero: [Servicio] - [Nombre Cliente]
    return `${service.name} - ${clientName}`;
  }
}

/**
 * Formatea la descripción del evento con la ficha completa del cliente
 * @param {Object} bookingData - Datos del turno
 * @param {string} businessName - Nombre del negocio
 * @returns {string} Descripción formateada
 */
function formatEventDescription(bookingData, businessName) {
  const { clientName, clientPhone, clientEmail, service, barber, date, time } = bookingData;
  
  return `
📋 FICHA COMPLETA DEL TURNO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 CLIENTE
Nombre: ${clientName}
Teléfono: ${clientPhone}
Email: ${clientEmail}

✂️ SERVICIO
Servicio: ${service.name}
Duración: ${service.duration} minutos
Precio: $${service.price}

💇 PROFESIONAL
Barbero: ${barber.name}

📅 FECHA Y HORA
Fecha: ${date}
Hora: ${time}

🏢 NEGOCIO
${businessName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}

/**
 * Crea un evento en Google Calendar usando la API REST
 * Nota: Esto requiere un backend para manejar OAuth 2.0 correctamente
 * Esta versión es para desarrollo/testing con URL de inserción directa
 */
export async function createCalendarEvent(bookingData, businessName, context = 'barber') {
  const { service, date, time, barber } = bookingData;
  
  // Determinar el calendarId según el contexto
  let calendarId;
  if (context === 'admin') {
    calendarId = ADMIN_CALENDAR_ID;
  } else {
    // Usar el calendarId personal del barbero
    calendarId = barber.calendarId || 'primary';
  }
  
  // Calcular fechas de inicio y fin
  const { start, end } = getStartEndDates(date, time, service.duration);
  
  // Formatear para Google Calendar
  const startTime = formatDateForCalendar(start);
  const endTime = formatDateForCalendar(end);
  
  // Crear el objeto del evento
  const event = {
    summary: formatEventTitle(bookingData, context),
    description: formatEventDescription(bookingData, businessName),
    start: {
      dateTime: `${date}T${time}:00`,
      timeZone: 'America/Argentina/Buenos_Aires', // Ajustar según la zona horaria
    },
    end: {
      dateTime: `${date}T${time}:00`.replace(/\d{2}:\d{2}$/, (match) => {
        const [h, m] = match.split(':').map(Number);
        const endMinutes = h * 60 + m + service.duration;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;
        return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      }),
      timeZone: 'America/Argentina/Buenos_Aires',
    },
    reminders: {
      useDefault: true,
    },
  };
  
  // En desarrollo, solo loguear el evento
  console.log(`📅 [${context.toUpperCase()}] Google Calendar Event:`, {
    calendarId,
    event,
    context: context === 'admin' ? 'Calendario central de la barbería' : `Calendario personal de ${barber.name}`
  });
  
  return {
    success: true,
    simulated: true,
    calendarId,
    event,
    message: `Evento creado en calendario ${context === 'admin' ? 'central' : `de ${barber.name}`} (simulado en desarrollo)`
  };
}

/**
 * Sincroniza un turno con los calendarios correspondientes
 * 1. Siempre lo agrega al calendario central del admin
 * 2. También lo agrega al calendario personal del barbero asignado
 */
export async function syncAppointmentWithCalendars(bookingData, businessName) {
  const results = {
    admin: null,
    barber: null,
    success: false,
    errors: []
  };
  
  try {
    // 1. Sincronizar con calendario del admin (todos los turnos)
    const adminResult = await createCalendarEvent(bookingData, businessName, 'admin');
    results.admin = adminResult;
    
    // 2. Sincronizar con calendario personal del barbero
    const barberResult = await createCalendarEvent(bookingData, businessName, 'barber');
    results.barber = barberResult;
    
    // Considerar exitoso si al menos uno funcionó
    results.success = adminResult.success || barberResult.success;
    
    return results;
  } catch (error) {
    console.error('Error sincronizando con calendarios:', error);
    results.errors.push(error.message);
    return results;
  }
}

/**
 * Genera URL para agregar evento a Google Calendar (método fallback)
 * Esta URL abre el formulario de Google Calendar con los datos precargados
 */
export function buildGoogleCalendarInsertUrl(bookingData, businessName, context = 'barber') {
  const { service, date, time, barber } = bookingData;
  
  // Determinar calendarId según contexto
  const calendarId = context === 'admin' ? ADMIN_CALENDAR_ID : (barber.calendarId || 'primary');
  
  // Calcular fechas
  const { start, end } = getStartEndDates(date, time, service.duration);
  const startTime = formatDateForCalendar(start);
  const endTime = formatDateForCalendar(end);
  
  // Construir URL
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: formatEventTitle(bookingData, context),
    dates: `${startTime}/${endTime}`,
    details: formatEventDescription(bookingData, businessName),
    location: businessName,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}