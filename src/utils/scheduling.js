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
  slotStep = 20,
}) {
  if (!barber) return [];

  // 1. Validar si la fecha está bloqueada
  if (barber.blockedDates?.includes(dateIso)) return [];

  // 2. Domingo cerrado por defecto (día 0)
  if (dayOfWeek === 0 && !barber.schedule?.[0]) return [];

  // 3. Obtener el rango horario del día (usar schedule del barbero o el default)
  const daySchedule = barber.schedule?.[dayOfWeek] || DEFAULT_DAY_SCHEDULE;
  if (!daySchedule || !daySchedule.start || !daySchedule.end) return [];

  // 4. Filtrar los turnos ocupados sanitizando la propiedad apt.time
  const busyRanges = (appointments || [])
    .filter(
      (apt) =>
        (apt.barberId === barber.id || apt.barber_id === barber.id) &&
        apt.date === dateIso &&
        apt.status !== 'cancelled' &&
        Boolean(apt.time)
    )
    .map((apt) => ({
      start: String(apt.time).slice(0, 5),
      end: addMinutes(String(apt.time).slice(0, 5), apt.durationMinutes || serviceDuration || 30),
    }));

  const blockedSlots = barber.blockedSlots?.[dateIso] || [];
  const slots = [];
  let cursor = daySchedule.start;

  const now = new Date();
  const isToday = dateIso === toLocalISODate(now);
  const nowHM = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  // 5. Generar slots paso a paso
  while (compareTime(addMinutes(cursor, serviceDuration), daySchedule.end) <= 0) {
    const slotEnd = addMinutes(cursor, serviceDuration);

    const overlapsBusy = busyRanges.some(
      (r) => compareTime(cursor, r.end) < 0 && compareTime(slotEnd, r.start) > 0
    );
    const isBlocked = blockedSlots.includes(cursor);
    const isPast = isToday && compareTime(cursor, nowHM) <= 0;

    if (!overlapsBusy && !isBlocked && !isPast) {
      slots.push(cursor);
    }
    cursor = addMinutes(cursor, slotStep);
  }

  return slots;
}