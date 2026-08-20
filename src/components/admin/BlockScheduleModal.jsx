import React, { useState } from 'react';
import { X, Ban } from 'lucide-react';
import Button from '../shared/Button.jsx';

/**
 * BlockScheduleModal
 * --------------------
 * Permite al dueño/barbero bloquear manualmente:
 *  - un día completo (ej: vacaciones, feriado), o
 *  - un horario puntual dentro de un día (ej: "13:00 almuerzo").
 * Se usa para que esos horarios dejen de ofrecerse en el flujo de reserva.
 */
export default function BlockScheduleModal({ barbers, onClose, onConfirm }) {
  const [barberId, setBarberId] = useState(barbers[0]?.id || '');
  const [mode, setMode] = useState('day'); // 'day' | 'slot'
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const isValid = barberId && date && (mode === 'day' || (mode === 'slot' && time));

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm({ barberId, mode, date, time, reason });
  };

  return (
    <div className="fixed inset-0 bg-ink-950/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-paper-50 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 pb-8 sm:pb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl flex items-center gap-2">
            <Ban size={20} className="text-pole-red" /> Bloquear horario
          </h3>
          <button onClick={onClose} className="p-1 text-ink-700" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-ink-800 mb-1.5 block">Profesional</label>
            <select
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              className="w-full min-h-[46px] rounded-xl border-2 border-ink-900/10 px-3 bg-white text-base focus:outline-none focus:border-brass-500"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink-800 mb-1.5 block">¿Qué querés bloquear?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('day')}
                className={`min-h-[44px] rounded-xl border-2 text-sm font-semibold transition-colors
                  ${mode === 'day' ? 'bg-ink-900 border-ink-900 text-paper-50' : 'border-ink-900/10 text-ink-900'}`}
              >
                Día completo
              </button>
              <button
                onClick={() => setMode('slot')}
                className={`min-h-[44px] rounded-xl border-2 text-sm font-semibold transition-colors
                  ${mode === 'slot' ? 'bg-ink-900 border-ink-900 text-paper-50' : 'border-ink-900/10 text-ink-900'}`}
              >
                Horario puntual
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink-800 mb-1.5 block">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full min-h-[46px] rounded-xl border-2 border-ink-900/10 px-3 bg-white text-base focus:outline-none focus:border-brass-500"
            />
          </div>

          {mode === 'slot' && (
            <div>
              <label className="text-sm font-semibold text-ink-800 mb-1.5 block">Horario</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full min-h-[46px] rounded-xl border-2 border-ink-900/10 px-3 bg-white text-base focus:outline-none focus:border-brass-500"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-ink-800 mb-1.5 block">Motivo (opcional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Turno médico, feriado..."
              className="w-full min-h-[46px] rounded-xl border-2 border-ink-900/10 px-3 bg-white text-base focus:outline-none focus:border-brass-500"
            />
          </div>

          <Button variant="danger" fullWidth disabled={!isValid} onClick={handleConfirm}>
            Confirmar bloqueo
          </Button>
        </div>
      </div>
    </div>
  );
}
