import React, { useState } from 'react';
import { Clock3, Save, Check } from 'lucide-react';
import Card from '../shared/Card.jsx';
import Button from '../shared/Button.jsx';

const WEEKDAYS = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' },
];

/**
 * ScheduleConfig
 * ---------------
 * Configuración simple del horario semanal de atención de cada barbero.
 * Por cada día se puede activar/desactivar la atención y definir
 * hora de inicio y fin. Pensado para completarse en segundos, no
 * para gestión avanzada de turnos partidos (eso sería una v2).
 */
export default function ScheduleConfig({ barbers, onUpdateSchedule }) {
  const [selectedBarberId, setSelectedBarberId] = useState(barbers[0]?.id);
  const [savedFlash, setSavedFlash] = useState(false);
  const barber = barbers.find((b) => b.id === selectedBarberId);

  const [localSchedule, setLocalSchedule] = useState(barber?.schedule || {});

  const handleBarberChange = (id) => {
    setSelectedBarberId(id);
    setLocalSchedule(barbers.find((b) => b.id === id)?.schedule || {});
  };

  const toggleDay = (dayId) => {
    setLocalSchedule((prev) => {
      const next = { ...prev };
      if (next[dayId]) {
        delete next[dayId];
      } else {
        next[dayId] = { start: '09:00', end: '18:00' };
      }
      return next;
    });
  };

  const updateTime = (dayId, field, value) => {
    setLocalSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value },
    }));
  };

  const handleSave = () => {
    onUpdateSchedule(selectedBarberId, localSchedule);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  return (
    <div>
      <h2 className="text-xl font-display flex items-center gap-2 mb-3">
        <Clock3 size={20} className="text-brass-600" /> Horarios de atención
      </h2>

      {/* Selector de barbero */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
        {barbers.map((b) => (
          <button
            key={b.id}
            onClick={() => handleBarberChange(b.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors
              ${selectedBarberId === b.id ? 'bg-ink-900 border-ink-900 text-paper-50' : 'border-ink-900/10 text-ink-900'}`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <Card className="flex flex-col gap-3">
        {WEEKDAYS.map((day) => {
          const active = Boolean(localSchedule[day.id]);
          return (
            <div key={day.id} className="flex items-center gap-3 py-1 border-b border-ink-900/5 last:border-0 pb-3 last:pb-0">
              <button
                onClick={() => toggleDay(day.id)}
                className={`w-11 h-6 rounded-full shrink-0 relative transition-colors ${active ? 'bg-sage-500' : 'bg-ink-900/15'}`}
                aria-label={`${active ? 'Desactivar' : 'Activar'} atención el ${day.label}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </button>
              <span className="w-20 shrink-0 text-sm font-semibold text-ink-900">{day.label}</span>
              {active ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={localSchedule[day.id]?.start || '09:00'}
                    onChange={(e) => updateTime(day.id, 'start', e.target.value)}
                    className="flex-1 min-w-0 rounded-lg border border-ink-900/15 px-2 py-1.5 text-sm bg-paper-50"
                  />
                  <span className="text-ink-600 text-xs">a</span>
                  <input
                    type="time"
                    value={localSchedule[day.id]?.end || '18:00'}
                    onChange={(e) => updateTime(day.id, 'end', e.target.value)}
                    className="flex-1 min-w-0 rounded-lg border border-ink-900/15 px-2 py-1.5 text-sm bg-paper-50"
                  />
                </div>
              ) : (
                <span className="text-xs text-ink-600 flex-1">Cerrado</span>
              )}
            </div>
          );
        })}
      </Card>

      <Button
        variant="secondary"
        fullWidth
        className="mt-4"
        icon={savedFlash ? Check : Save}
        onClick={handleSave}
      >
        {savedFlash ? 'Horario guardado' : 'Guardar horario'}
      </Button>
    </div>
  );
}
