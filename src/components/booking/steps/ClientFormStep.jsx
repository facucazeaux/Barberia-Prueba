import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
import Button from '../../shared/Button.jsx';

/**
 * Paso 4: formulario mínimo indispensable (nombre + teléfono + email).
 * El email es necesario para enviar la confirmación del turno.
 */
export default function ClientFormStep({ onSubmit, onBack }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const nameValid = name.trim().length >= 2;
  const phoneValid = phone.trim().length >= 6;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid = nameValid && phoneValid && emailValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (isValid) {
      onSubmit({ 
        clientName: name.trim(), 
        clientPhone: phone.trim(),
        clientEmail: email.trim()
      });
    }
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 mb-3 hover:text-slate-300 transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>
      <h2 className="text-2xl mb-1 text-white">Por último, tus datos</h2>
      <p className="text-slate-400 text-sm mb-5">
        Te enviaremos la confirmación del turno por email.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <User size={15} /> Nombre y apellido
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Martín Torres"
            className={`w-full min-h-[46px] rounded-xl border-2 px-4 text-base bg-slate-800 text-white focus:outline-none transition-colors
              ${touched && !nameValid ? 'border-red-500' : 'border-slate-700 focus:border-amber-500'}`}
          />
          {touched && !nameValid && (
            <p className="text-red-400 text-xs mt-1">Ingresá tu nombre completo.</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Phone size={15} /> WhatsApp / Teléfono
          </label>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 11 5555-1234"
            className={`w-full min-h-[46px] rounded-xl border-2 px-4 text-base bg-slate-800 text-white focus:outline-none transition-colors
              ${touched && !phoneValid ? 'border-red-500' : 'border-slate-700 focus:border-amber-500'}`}
          />
          {touched && !phoneValid && (
            <p className="text-red-400 text-xs mt-1">Ingresá un teléfono válido.</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail size={15} /> Email
          </label>
          <input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ej: martin@email.com"
            className={`w-full min-h-[46px] rounded-xl border-2 px-4 text-base bg-slate-800 text-white focus:outline-none transition-colors
              ${touched && !emailValid ? 'border-red-500' : 'border-slate-700 focus:border-amber-500'}`}
          />
          {touched && !emailValid && (
            <p className="text-red-400 text-xs mt-1">Ingresá un email válido.</p>
          )}
        </div>

        <Button type="submit" variant="secondary" fullWidth className="mt-2">
          Confirmar turno
        </Button>
      </form>
    </div>
  );
}
