import React, { useState } from 'react';
import { Scissors, Lock, Mail, KeyRound } from 'lucide-react';

// Credenciales por defecto para desarrollo. En producción, esto se
// reemplazará con Supabase Auth u otro servicio de autenticación.
const ADMIN_EMAIL = 'admin@barberia.com';
const ADMIN_PASSWORD = 'admin123';

// Cuánto tiempo se recuerda la sesión en este dispositivo antes de
// volver a pedir credenciales (en milisegundos). 12 horas = un turno de trabajo.
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const STORAGE_KEY = 'admin_session_expires_at';
const USER_STORAGE_KEY = 'admin_user';

/** Devuelve true si hay una sesión de admin vigente guardada en este dispositivo. */
export function hasValidAdminSession() {
  const expiresAt = Number(localStorage.getItem(STORAGE_KEY) || 0);
  return Date.now() < expiresAt;
}

/** Devuelve el usuario actual de la sesión */
export function getCurrentAdminUser() {
  const userStr = localStorage.getItem(USER_STORAGE_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

function startAdminSession(user) {
  localStorage.setItem(STORAGE_KEY, String(Date.now() + SESSION_DURATION_MS));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function endAdminSession() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * AdminLogin
 * -----------
 * Pantalla de acceso al panel admin mediante email y contraseña.
 * Preparada para integración con Supabase Auth en el futuro.
 */
export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulación de autenticación. En producción, esto se reemplazará con:
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });
    
    setTimeout(() => {
      setLoading(false);
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const user = { email, id: 'admin-user-1' };
        startAdminSession(user);
        onSuccess();
      } else {
        setError('Credenciales incorrectas. Por favor, intentá de nuevo.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 text-white">
      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
        <Scissors size={24} className="text-amber-500" />
      </div>
      <h1 className="font-display text-xl mb-1">Panel del dueño</h1>
      <p className="text-slate-400 text-sm mb-8 flex items-center gap-1.5">
        <Lock size={13} /> Ingresá tus credenciales
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-[320px] flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail size={15} /> Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@barberia.com"
            className="w-full min-h-[46px] rounded-xl border-2 px-4 text-base bg-slate-800 text-white focus:outline-none transition-colors border-slate-700 focus:border-amber-500"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <KeyRound size={15} /> Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full min-h-[46px] rounded-xl border-2 px-4 text-base bg-slate-800 text-white focus:outline-none transition-colors border-slate-700 focus:border-amber-500"
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[46px] rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="text-slate-500 text-xs mt-6 text-center">
        Credenciales de desarrollo: admin@barberia.com / admin123
      </p>
    </div>
  );
}
