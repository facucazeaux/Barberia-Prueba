import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Card from '../../shared/Card.jsx';
import Button from '../../shared/Button.jsx';

/**
 * Paso 2: elegir con qué barbero/estilista se quiere el turno.
 * Solo se muestran los profesionales que ofrecen el servicio elegido.
 */
export default function BarberStep({ barbers, selectedService, onSelect, onBack }) {
  const availableBarbers = barbers.filter((b) => b.serviceIds.includes(selectedService.id));

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 mb-3 hover:text-slate-300 transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>
      <h2 className="text-2xl mb-1 text-white">¿Con quién preferís?</h2>
      <p className="text-slate-400 text-sm mb-5">
        Profesionales disponibles para <span className="font-semibold text-white">{selectedService.name}</span>.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {availableBarbers.map((barber) => (
          <Card key={barber.id} onClick={() => onSelect(barber)} className="flex items-center gap-4">
            <div
              className={`w-12 h-12 shrink-0 rounded-full ${barber.avatarColor} flex items-center justify-center text-white font-display text-sm`}
            >
              {barber.initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg leading-tight text-white">{barber.name}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{barber.role}</p>
            </div>
            <ArrowRight size={16} className="text-slate-500 shrink-0" />
          </Card>
        ))}

        {availableBarbers.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-6">
            No hay profesionales disponibles para este servicio por ahora.
          </p>
        )}
      </div>

      {/* Opción "sin preferencia" para clientes que no les importa quién los atienda */}
      {availableBarbers.length > 1 && (
        <Button
          variant="ghost"
          fullWidth
          className="mt-3"
          onClick={() =>
            onSelect(availableBarbers[Math.floor(Math.random() * availableBarbers.length)])
          }
        >
          No tengo preferencia, cualquiera está bien
        </Button>
      )}
    </div>
  );
}
