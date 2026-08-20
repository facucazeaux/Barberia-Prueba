import React, { useState, useEffect } from 'react';
import { CalendarDays, Ban, Clock3, Scissors, Plus, LogOut } from 'lucide-react';
import AgendaView from './AgendaView.jsx';
import BlockScheduleModal from './BlockScheduleModal.jsx';
import ScheduleConfig from './ScheduleConfig.jsx';
import Button from '../shared/Button.jsx';
import { endAdminSession } from './AdminLogin.jsx';
import { getBarbers, getAppointments, cancelAppointment as cancelAppointmentService } from '../../services/appointmentsService.js';

const BUSINESS_NAME = 'Barbería Tandil';

const TABS = [
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'schedule', label: 'Horarios', icon: Clock3 },
];

/**
 * AdminDashboard
 * ---------------
 * Panel del dueño/barbero. Pensado para revisarse "en el mostrador"
 * entre cliente y cliente: todo a un tap, sin menús anidados.
 *
 * Mantiene su propia copia local de barberos y turnos (inicializada
 * desde el mock data) para poder reflejar cambios de la sesión
 * (cancelaciones, bloqueos, edición de horarios) en la UI al instante.
 */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('agenda');
  const [barbers, setBarbers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState('all');
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      const [barbersData, appointmentsData] = await Promise.all([
        getBarbers(),
        getAppointments()
      ]);
      setBarbers(barbersData);
      setAppointments(appointmentsData);
    };
    loadData();
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    await cancelAppointmentService(appointmentId);
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt))
    );
  };

  const handleBlockConfirm = ({ barberId, mode, date, time }) => {
    setBarbers((prev) =>
      prev.map((b) => {
        if (b.id !== barberId) return b;
        if (mode === 'day') {
          return { ...b, blockedDates: [...(b.blockedDates || []), date] };
        }
        // mode === 'slot': se guarda dentro de blockedSlots[date] = [...]
        const currentSlots = b.blockedSlots?.[date] || [];
        return {
          ...b,
          blockedSlots: {
            ...(b.blockedSlots || {}),
            [date]: [...currentSlots, time].filter(Boolean),
          },
        };
      })
    );
    setShowBlockModal(false);
  };

  const handleUpdateSchedule = (barberId, newSchedule) => {
    setBarbers((prev) =>
      prev.map((b) => (b.id === barberId ? { ...b, schedule: newSchedule } : b))
    );
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-slate-950 pb-16">
      {/* Encabezado */}
      <header className="px-4 pt-6 pb-4 sticky top-0 bg-slate-950/95 backdrop-blur z-10 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <Scissors size={16} className="text-amber-500" />
            </div>
            <div>
              <h1 className="font-display text-lg leading-none text-white">{BUSINESS_NAME}</h1>
              <p className="text-[11px] text-slate-400">Panel del dueño</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="danger" icon={Plus} onClick={() => setShowBlockModal(true)} className="!min-h-[38px] !text-xs !px-3">
              Bloquear
            </Button>
            <button
              onClick={() => {
                endAdminSession();
                window.location.reload();
              }}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Filtro por profesional */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
          <button
            onClick={() => setSelectedBarberId('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors
              ${selectedBarberId === 'all' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 text-slate-300 hover:border-slate-600'}`}
          >
            Todos
          </button>
          {barbers.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBarberId(b.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors
                ${selectedBarberId === b.id ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 text-slate-300 hover:border-slate-600'}`}
            >
              {b.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Tabs de sección */}
        <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 min-h-[38px] rounded-lg text-sm font-semibold transition-colors
                  ${isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'}`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-4 pt-4">
        {activeTab === 'agenda' && (
          <AgendaView
            barbers={barbers}
            appointments={appointments}
            selectedBarberId={selectedBarberId}
            onCancelAppointment={handleCancelAppointment}
            businessName={BUSINESS_NAME}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleConfig barbers={barbers} onUpdateSchedule={handleUpdateSchedule} />
        )}
      </main>

      {showBlockModal && (
        <BlockScheduleModal
          barbers={barbers}
          onClose={() => setShowBlockModal(false)}
          onConfirm={handleBlockConfirm}
        />
      )}
    </div>
  );
}
