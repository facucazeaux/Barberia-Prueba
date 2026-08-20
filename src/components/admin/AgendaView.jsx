import React, { useMemo, useState, useEffect } from 'react';
import { Clock, User, Phone, XCircle, CalendarDays, Download } from 'lucide-react';
import { getUpcomingDays } from '../../utils/scheduling.js';
import { getServices } from '../../services/appointmentsService.js';
import { buildMultiEventICS, downloadICSFile } from '../../utils/calendar.js';
import Button from '../shared/Button.jsx';
import Card from '../shared/Card.jsx';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

/**
 * AgendaView
 * -----------
 * Vista rápida de los turnos del día seleccionado (con navegación a
 * los próximos días) para un barbero (o "Todos"). Permite cancelar
 * turnos y exportar la agenda completa a un archivo .ics para
 * sincronizarla con el calendario personal del dueño/barbero.
 */
export default function AgendaView({ barbers, appointments, selectedBarberId, onCancelAppointment, businessName }) {
  const days = useMemo(() => getUpcomingDays(7), []);
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [services, setServices] = useState([]);

  // Cargar servicios
  useEffect(() => {
    const loadServices = async () => {
      const servicesData = await getServices();
      setServices(servicesData);
    };
    loadServices();
  }, []);

  const dayAppointments = appointments
    .filter(
      (apt) =>
        apt.date === selectedDay.iso &&
        apt.status === 'confirmed' &&
        (selectedBarberId === 'all' || apt.barberId === selectedBarberId)
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  const getBarber = (id) => barbers.find((b) => b.id === id);
  const getService = (id) => services.find((s) => s.id === id);

  // Exporta TODOS los turnos confirmados de la semana visible a un solo .ics,
  // para que el dueño/barbero los importe de una vez en su calendario personal.
  const handleExportWeek = () => {
    const weekIsoSet = new Set(days.map((d) => d.iso));
    const relevant = appointments.filter(
      (apt) =>
        apt.status === 'confirmed' &&
        weekIsoSet.has(apt.date) &&
        (selectedBarberId === 'all' || apt.barberId === selectedBarberId)
    );

    const events = relevant.map((apt) => {
      const service = getService(apt.serviceId);
      const barber = getBarber(apt.barberId);
      return {
        title: `${service?.name || 'Turno'} - ${apt.clientName}`,
        description: `Cliente: ${apt.clientName} (${apt.clientPhone}). Barbero: ${barber?.name}.`,
        location: businessName,
        date: apt.date,
        time: apt.time,
        durationMinutes: service?.duration || 30,
        uid: apt.id,
      };
    });

    if (events.length === 0) return;
    const ics = buildMultiEventICS(events);
    downloadICSFile(ics, `agenda-semana-${days[0].iso}.ics`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-display flex items-center gap-2 text-white">
          <CalendarDays size={20} className="text-amber-500" /> Agenda
        </h2>
        <Button variant="outline" icon={Download} onClick={handleExportWeek} className="!min-h-[36px] !text-xs !px-3">
          Exportar semana (.ics)
        </Button>
      </div>

      {/* Selector de día */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {days.map((day) => {
          const isSelected = day.iso === selectedDay.iso;
          return (
            <button
              key={day.iso}
              onClick={() => setSelectedDay(day)}
              className={`shrink-0 w-16 py-2 rounded-xl2 flex flex-col items-center gap-0.5 border transition-colors
                ${isSelected ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}`}
            >
              <span className="text-[11px] uppercase tracking-wide opacity-80">{day.weekdayLabel}</span>
              <span className="font-display text-lg leading-none">{day.dayNumber}</span>
            </button>
          );
        })}
      </div>

      {/* Lista de turnos del día */}
      <div className="flex flex-col gap-2.5 mt-4">
        {dayAppointments.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-10">
            No hay turnos agendados para este día.
          </p>
        )}

        {dayAppointments.map((apt) => {
          const barber = getBarber(apt.barberId);
          const service = getService(apt.serviceId);
          return (
            <Card key={apt.id} className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center w-14 shrink-0">
                <Clock size={14} className="text-amber-500 mb-0.5" />
                <span className="font-display text-sm text-white">{apt.time}</span>
              </div>
              <div className="w-px self-stretch bg-slate-700" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white flex items-center gap-1 truncate">
                  <User size={13} className="shrink-0 text-slate-400" /> {apt.clientName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {service?.name} · {barber?.name}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone size={11} /> {apt.clientPhone}
                </p>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                <span className="text-xs font-semibold text-slate-400">
                  {formatPrice(service?.price || 0)}
                </span>
                <button
                  onClick={() => onCancelAppointment(apt.id)}
                  className="text-red-400 text-xs font-semibold flex items-center gap-1 active:scale-95 hover:text-red-300"
                  aria-label={`Cancelar turno de ${apt.clientName}`}
                >
                  <XCircle size={14} /> Cancelar
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
