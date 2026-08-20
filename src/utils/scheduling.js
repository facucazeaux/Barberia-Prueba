// =============================================================
// UTILIDADES DE AGENDA
// Calculan qué días y horarios están realmente disponibles para
// reservar, cruzando el horario semanal del barbero con los
// turnos ya confirmados y los bloqueos manuales.
// =============================================================

const DAY_MS = 24 * 60 * 60 * 1000;

/** Devuelve 'YYYY-MM-DD' en horario local (evita bugs de zona horaria de toISOString) */
export function toLocalISODate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Devuelve un array de los próximos `days` días como objetos
 * { iso, dayOfWeek, label, dayNumber } para pintar el selector de fecha.
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

/** Suma minutos a un string 'HH:mm' y devuelve otro string 'HH:mm' */
function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Compara dos horas 'HH:mm' -> negativo si a < b, 0 si iguales, positivo si a > b */
function compareTime(a, b) {
  return a.localeCompare(b);
}

/**
 * Calcula los horarios disponibles para un barbero en una fecha dada,
 * en función de:
 *  - su horario de atención semanal (schedule)
 *  - la duración del servicio elegido
 *  - los turnos ya confirmados ese día (appointments)
 *  - fechas/horarios bloqueados manualmente
 *
 * @returns {string[]} lista de horarios 'HH:mm' disponibles
 */
export function getAvailableSlots({
  barber,
  dateIso,
  dayOfWeek,
  serviceDuration,
  appointments,
  slotStep = 20, // cada cuántos minutos se ofrece un horario de inicio
}) {
  // Día completo bloqueado por el barbero (vacaciones, feriado, etc)
  if (barber.blockedDates?.includes(dateIso)) return [];

  const daySchedule = barber.schedule[dayOfWeek];
  if (!daySchedule) return []; // el barbero no atiende ese día de la semana

  const busyRanges = appointments
    .filter(
      (apt) =>
        apt.barberId === barber.id &&
        apt.date === dateIso &&
        apt.status === 'confirmed'
    )
    .map((apt) => ({
      start: apt.time,
      end: addMinutes(apt.time, apt.durationMinutes || 30),
    }));

  // Horarios puntuales bloqueados manualmente por el barbero (ej. "13:00 almuerzo")
  const blockedSlots = barber.blockedSlots?.[dateIso] || [];

  const slots = [];
  let cursor = daySchedule.start;

  // Si es hoy, no ofrecer horarios que ya pasaron
  const now = new Date();
  const isToday = dateIso === toLocalISODate(now);
  const nowHM = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

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
