import React from 'react';
import { CheckCircle2, Scissors, User, Calendar, Clock, RotateCcw, MailCheck, CalendarSync } from 'lucide-react';
import Button from '../../shared/Button.jsx';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

const formatFriendlyDate = (dayLabel) =>
  `${dayLabel.weekdayLabel} ${dayLabel.dayNumber} de ${dayLabel.monthLabel}`;

/**
 * Paso final: confirma visualmente el turno y muestra que se envió
 * el email de confirmación y se sincronizó el calendario.
 */
export default function ConfirmationStep({ booking, businessName, businessAddress, onNewBooking, emailSent, calendarSynced }) {
  const { service, barber, date, time, dayLabel, clientName, clientEmail } = booking;

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
        <CheckCircle2 size={34} className="text-emerald-500" strokeWidth={2} />
      </div>
      <h2 className="text-2xl mb-1 text-white">¡Turno confirmado!</h2>
      <p className="text-slate-400 text-sm mb-6">
        Te esperamos, {clientName.split(' ')[0]}. Hemos enviado la confirmación a tu email.
      </p>

      {/* Indicadores de servicios realizados */}
      <div className="space-y-2 mb-6">
        {emailSent && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-3 flex items-center gap-3">
            <MailCheck size={20} className="text-emerald-500" />
            <div className="text-left">
              <p className="text-sm text-white font-medium">Email enviado</p>
              <p className="text-xs text-slate-400">Revisa {clientEmail}</p>
            </div>
          </div>
        )}
        
        {calendarSynced && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-3 flex items-center gap-3">
            <CalendarSync size={20} className="text-amber-500" />
            <div className="text-left">
              <p className="text-sm text-white font-medium">Calendario sincronizado</p>
              <p className="text-xs text-slate-400">Agenda actualizada</p>
            </div>
          </div>
        )}
      </div>

      {/* Resumen del turno */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-left flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Scissors size={18} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Servicio</p>
            <p className="font-semibold text-white">
              {service.name} · {formatPrice(service.price)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User size={18} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Profesional</p>
            <p className="font-semibold text-white">{barber.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Fecha</p>
            <p className="font-semibold text-white capitalize">{formatFriendlyDate(dayLabel)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Horario</p>
            <p className="font-semibold text-white">{time} hs</p>
          </div>
        </div>
      </div>

      <Button variant="ghost" fullWidth className="mt-6" icon={RotateCcw} onClick={onNewBooking}>
        Reservar otro turno
      </Button>
    </div>
  );
}
