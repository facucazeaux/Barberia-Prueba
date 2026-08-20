import React from 'react';

/**
 * Botón base reutilizable en toda la app.
 * variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
 * Todos los tamaños son táctiles (min-h 44px) para uso cómodo en móvil.
 */
export default function Button({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  fullWidth = false,
  disabled = false,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm px-4 min-h-[44px] transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600',
    outline: 'border-2 border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-500',
    danger: 'bg-red-600 text-white hover:bg-red-500',
    ghost: 'text-slate-400 hover:bg-slate-800 hover:text-slate-300',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={18} strokeWidth={2.2} />}
      {children}
    </button>
  );
}
