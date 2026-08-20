import React from 'react';
import { Scissors, Sparkles, Star, Palette, ArrowRight, Clock } from 'lucide-react';
import Card from '../../shared/Card.jsx';

// Mapa de nombre de ícono (string, viene del mock data) -> componente real de lucide-react.
const ICONS = { Scissors, Sparkles, Star, Palette };

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

/**
 * Paso 1 del flujo de reserva: elegir el servicio deseado.
 * Al tocar una tarjeta se selecciona y avanza automáticamente,
 * minimizando taps para el cliente.
 */
export default function ServiceStep({ services, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl mb-1 text-white">¿Qué te vas a hacer?</h2>
      <p className="text-slate-400 text-sm mb-5">Elegí el servicio para ver los profesionales disponibles.</p>

      <div className="grid grid-cols-1 gap-3">
        {services.map((service) => {
          const Icon = ICONS[service.icon] || Scissors;
          return (
            <Card key={service.id} onClick={() => onSelect(service)} className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <Icon size={22} className="text-amber-500" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg leading-tight text-white">{service.name}</h3>
                <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{service.description}</p>
                <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                  <Clock size={12} />
                  <span>{service.duration} min</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-base text-white">{formatPrice(service.price)}</div>
                <ArrowRight size={16} className="text-slate-500 ml-auto mt-1" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
