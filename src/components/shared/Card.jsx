import React from 'react';

/** Contenedor tipo tarjeta, usado en toda la app para agrupar contenido. */
export default function Card({ children, className = '', onClick, selected = false }) {
  const interactive = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 rounded-xl2 shadow-card p-4 border border-slate-800 ${
        interactive ? 'cursor-pointer transition-all active:scale-[0.98] hover:border-slate-700' : ''
      } ${
        selected
          ? 'ring-2 ring-amber-500 border-amber-500'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
