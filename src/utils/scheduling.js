// =============================================================
// UTILIDADES DE AGENDA (Compatibles con Supabase)
// =============================================================

const DAY_MS = 24 * 60 * 60 * 1000;

/** Horario general por defecto (Lunes a Sábado 09:00 a 20:00) */
const DEFAULT_DAY_SCHEDULE = { start: '09:00', end: '20:00' };

/** Devuelve 'YYYY-MM-DD' en horario local */
export function toLocalISODate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Devuelve un array de los próximos `days` días
 */
export function getUpcomingDays(days = 14) {
  const weekdayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthLabels = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const d = new Date(today.getTime() + i * DAY_MS);
    result.push({
      date: d,
      iso: toLocalISODate(d),
      dayOfWeek: d.getDay(),
      weekdayLabel: weekdayLabels[d.getDay()],
      dayNumber: d.getDate(),
      monthLabel: monthLabels[d.getMonth()],
      isToday: i === 0,
    });
  }
  return result;
}

/** Suma minutos a un string 'HH:mm' de forma segura */
function addMinutes(time = '00:00', minutes = 0) {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return '00:00';
  }
  const [h, m] = time.split(':').map(Number);
  const total = (h || 0) * 60 + (m || 0) + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Compara dos horas 'HH:mm' */
function compareTime(a = '00:00', b = '00:00') {
  return a.localeCompare(b);
}

/**
 * Calcula los horarios disponibles para un barbero en una fecha dada.
 */
export function getAvailableSlots({
  barber,
  dateIso,
  dayOfWeek,
  serviceDuration = 30,
  appointments = [],
  slotStep = 30, // Intervalos de 30 minutos
}) {
  if (!barber) return [];

  // Horario por defecto: Lunes a Sábado de 09:00 a 20:00
  const defaultSchedule = { start: '09:00', end: '20:00' };
  
  // Buscar schedule del barbero o usar el por defecto
  const daySchedule = barber?.schedule?.[dayOfWeek] || (dayOfWeek !== 0 ? defaultSchedule : null);

  if (!daySchedule || !daySchedule.start || !daySchedule.end) return [];

  // Obtener turnos ocupados
  const busyTimes = (appointments || [])
    .filter(
      (apt) =>
        (String(apt.barberId) === String(barber.id) || String(apt.barber_id) === String(barber.id)) &&
        apt.date === dateIso &&
        apt.status !== 'cancelled' &&
        Boolean(apt.time)
    )
    .map((apt) => String(apt.time).slice(0, 5));

  const slots = [];
  let cursor = daySchedule.start;

  // Generar lista de horarios paso a paso
  while (compareTime(addMinutes(cursor, serviceDuration), daySchedule.end) <= 0) {
    const isOccupied = busyTimes.includes(cursor);

    if (!isOccupied) {
      slots.push(cursor);
    }
    cursor = addMinutes(cursor, slotStep);
  }

  return slots;
}