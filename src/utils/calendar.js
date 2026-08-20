// =============================================================
// UTILIDADES DE CALENDARIO
// Punto clave del sistema: permite que el turno reservado termine
// en el calendario personal del cliente (o del barbero) en 1 tap,
// sin necesidad de ninguna integración de backend.
// =============================================================

/**
 * Convierte fecha ('YYYY-MM-DD') + hora ('HH:mm') + duración (minutos)
 * en un objeto con inicio y fin como Date.
 */
export function getStartEndDates(date, time, durationMinutes) {
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return { start, end };
}

/**
 * Formatea una fecha JS al formato requerido por Google Calendar / ICS:
 * YYYYMMDDTHHmmSS (hora local, sin separadores).
 */
export function formatDateForCalendar(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}
/**
 * Genera la URL para "Agregar a Google Calendar".
 * No requiere API key ni OAuth: Google acepta un link de evento con
 * parámetros de querystring que abre el formulario ya completado.
 *
 * @param {Object} params
 * @param {string} params.title - Título del evento
 * @param {string} params.description - Descripción/detalle
 * @param {string} params.location - Dirección o nombre del local
 * @param {string} params.date - 'YYYY-MM-DD'
 * @param {string} params.time - 'HH:mm'
 * @param {number} params.durationMinutes
 * @returns {string} URL lista para usar en un <a href>
 */
export function buildGoogleCalendarUrl({
  title,
  description,
  location,
  date,
  time,
  durationMinutes,
}) {
  const { start, end } = getStartEndDates(date, time, durationMinutes);
  const dates = `${formatDateForCalendar(start)}/${formatDateForCalendar(end)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details: description || '',
    location: location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Genera el contenido de texto de un archivo .ics (formato iCalendar),
 * compatible con Apple Calendar, Outlook y el calendario nativo de Android/iOS.
 *
 * @param {Object} params - mismos parámetros que buildGoogleCalendarUrl
 * @returns {string} contenido del archivo .ics
 */
export function buildICSContent({
  title,
  description,
  location,
  date,
  time,
  durationMinutes,
  uid,
}) {
  const { start, end } = getStartEndDates(date, time, durationMinutes);
  const now = new Date();

  // El formato ICS requiere \r\n como salto de línea y escapar comas/saltos.
  const escapeText = (text = '') =>
    text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Turnos Barberia//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid || `${Date.now()}@turnos-barberia`}`,
    `DTSTAMP:${formatDateForCalendar(now)}`,
    `DTSTART:${formatDateForCalendar(start)}`,
    `DTEND:${formatDateForCalendar(end)}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description || '')}`,
    `LOCATION:${escapeText(location || '')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

/**
 * Dispara la descarga de un archivo .ics en el navegador del cliente.
 * Funciona en desktop y en la mayoría de navegadores móviles (el SO
 * detecta el MIME type "text/calendar" y ofrece agregarlo al calendario).
 */
export function downloadICSFile(icsContent, filename = 'turno-barberia.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Libera memoria una vez que el navegador ya inició la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Genera el contenido .ics combinado para VARIOS turnos a la vez
 * (usado en el panel admin para exportar la agenda del día/semana
 * en un solo archivo con múltiples eventos VEVENT).
 */
export function buildMultiEventICS(events) {
  const now = new Date();
  const escapeText = (text = '') =>
    text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  const veventBlocks = events.map((evt) => {
    const { start, end } = getStartEndDates(evt.date, evt.time, evt.durationMinutes);
    return [
      'BEGIN:VEVENT',
      `UID:${evt.uid || `${evt.date}-${evt.time}-${Math.random()}@turnos-barberia`}`,
      `DTSTAMP:${formatDateForCalendar(now)}`,
      `DTSTART:${formatDateForCalendar(start)}`,
      `DTEND:${formatDateForCalendar(end)}`,
      `SUMMARY:${escapeText(evt.title)}`,
      `DESCRIPTION:${escapeText(evt.description || '')}`,
      `LOCATION:${escapeText(evt.location || '')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Turnos Barberia//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...veventBlocks,
    'END:VCALENDAR',
  ].join('\r\n');
}
