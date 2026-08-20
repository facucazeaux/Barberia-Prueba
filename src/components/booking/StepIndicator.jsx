import React from 'react';
import { Check } from 'lucide-react';

/**
 * Barra de progreso horizontal para el flujo de reserva.
 * Muestra claramente en qué paso está el cliente: reduce la ansiedad
 * de "cuánto falta" en flujos de varios pasos en móvil.
 */
export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full px-1 mb-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                  ${isCurrent ? 'bg-amber-500 text-slate-950' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-slate-800 text-slate-500' : ''}
                `}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : index + 1}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded ${
                  isCompleted ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
