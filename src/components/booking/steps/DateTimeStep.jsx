import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, CalendarX2 } from 'lucide-react';
import { getUpcomingDays, getAvailableSlots } from '../../../utils/scheduling.js';
import { getAppointments } from '../../../services/appointmentsService.js';
import Button from '../../shared/Button.jsx';

// Rango de atención por defecto (Lunes a Sábado de 09:00 a 20:00, Domingo cerrado)
const DEFAULT_SCHEDULE = {
  1: { start: '09:00', end: '20:00' }, // Lunes
  2: { start: '09:00', end: '20:00' }, // Martes
  3: { start: '09:00', end: '20:00' }, // Miércoles
  4: { start: '09:00', end: '20:00' }, // Jueves
  5: { start: '09:00', end: '20:00' }, // Viernes
  6: { start: '09:00', end: '20:00' }, // Sábado
  0: null                              // Domingo
};

/**
 * Paso 3: elegir día y horario.
 */
export default function DateTimeStep({ selectedBarber, selectedService, onSelect, onBack }) {
  const days = useMemo(() => getUpcomingDays(14), []);
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [appointments, setAppointments] = useState([]);

  // Cargar turnos desde Supabase
  useEffect(() => {
    const loadAppointments = async () => {
      const appointmentsData = await getAppointments();
      setAppointments(appointmentsData || []);
    };
    loadAppointments();
  }, []);

  // Fusionar schedule del barbero con el por defecto
  const barberSchedule = useMemo(() => {
    return {
      ...DEFAULT_SCHEDULE,
      ...(selectedBarber?.schedule || {})
    };
  }, [selectedBarber]);

  const slots = useMemo(
    () =>
      getAvailableSlots({
        barber: {
          ...selectedBarber,
          schedule: barberSchedule
        },
        dateIso: selectedDay.iso,
        dayOfWeek: selectedDay.dayOfWeek,
        serviceDuration: selectedService?.duration || 30,
        appointments: appointments,
      }),
    [selectedBarber, selectedDay, selectedService, appointments, barberSchedule]
  );

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 mb-3 hover:text-slate-300 transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>
      <h2 className="text-2xl mb-1 text-white">Elegí día y horario</h2>
      <p className="text-slate-400 text-sm mb-5">
        Con <span className="font-semibold text-white">{selectedBarber?.name || 'el profesional'}</span>
      </p>

      {/* Selector de día */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
        {days.map((day) => {
          const isSelected = day.iso === selectedDay.iso;
          const attendsThisDay = Boolean(barberSchedule[day.dayOfWeek]);

          return (
            <button
              key={day.iso}
              onClick={() => setSelectedDay(day)}
              disabled={!attendsThisDay}
              className={`shrink-0 w-16 py-2.5 rounded-xl flex flex-col items-center gap-0.5 border transition-colors
                ${isSelected ? 'bg-amber-500 border-amber-500 text-slate-950 font-semibold' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}
                ${!attendsThisDay ? 'opacity-30 pointer-events-none' : ''}
              `}
            >
              <span className="text-[11px] uppercase tracking-wide opacity-80">{day.weekdayLabel}</span>
              <span className="font-display text-lg leading-none">{day.dayNumber}</span>
              {day.isToday && (
                <span className="text-[9px] uppercase font-semibold text-amber-500">Hoy</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selector de horario */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">
          Horarios disponibles el {selectedDay.dayNumber} de{' '}
          {selectedDay.monthLabel?.toLowerCase()}
        </h3>

        {slots.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                onClick={() => onSelect({ date: selectedDay.iso, time: slot, dayLabel: selectedDay })}
                className="min-h-[44px] rounded-xl border-2 border-slate-700 font-semibold text-sm text-slate-300 hover:border-amber-500 hover:bg-amber-500/10 active:scale-[0.96] transition-all"
              >
                {slot}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 flex flex-col items-center gap-2">
            <CalendarX2 size={28} className="text-slate-500" />
            <p className="text-slate-400 text-sm">No hay horarios libres este día.</p>
            <Button variant="outline" onClick={() => {
              const next = days.find((d) => d.iso > selectedDay.iso && barberSchedule[d.dayOfWeek]);
              if (next) setSelectedDay(next);
            }}>
              Probar el próximo día disponible
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}