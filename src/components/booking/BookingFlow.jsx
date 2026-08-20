import React, { useState, useEffect } from 'react';
import { Scissors } from 'lucide-react';
import StepIndicator from './StepIndicator.jsx';
import ServiceStep from './steps/ServiceStep.jsx';
import BarberStep from './steps/BarberStep.jsx';
import DateTimeStep from './steps/DateTimeStep.jsx';
import ClientFormStep from './steps/ClientFormStep.jsx';
import ConfirmationStep from './steps/ConfirmationStep.jsx';
import { getServices, getBarbers, createAppointment } from '../../services/appointmentsService';
import { sendBookingConfirmationEmail } from '../../services/emailService.js';
import { syncAppointmentWithCalendars } from '../../services/googleCalendarService.js';

const STEP_LABELS = ['Servicio', 'Profesional', 'Horario', 'Datos', 'Listo'];
const BUSINESS_NAME = 'Barbería El Zaguán';
const BUSINESS_ADDRESS = 'Av. Corrientes 1234, CABA';

/**
 * BookingFlow
 * ------------
 * Flujo de reserva del cliente, sin login, en 5 pasos:
 * Servicio -> Profesional -> Fecha/Hora -> Datos -> Confirmación.
 *
 * Mantiene un único estado local `booking` que se va completando a
 * medida que el cliente avanza, y un índice `step` que controla qué
 * pantalla se renderiza. Este patrón (wizard controlado por estado)
 * es simple de seguir y fácil de conectar a una API real más adelante.
 */
export default function BookingFlow() {
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const [calendarSynced, setCalendarSynced] = useState(false);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);

// Cargar datos iniciales desde Supabase
  useEffect(() => {
    async function fetchData() {
      const servicesData = await getServices();
      const barbersData = await getBarbers();
      setServices(servicesData);
      setBarbers(barbersData);
    }
    fetchData();
  }, []);

  const goTo = (nextStep) => {
    setStep(nextStep);
    // Al cambiar de paso, llevamos el scroll arriba (clave en flujos largos en móvil)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServiceSelect = (service) => {
    setBooking((prev) => ({ ...prev, service }));
    goTo(1);
  };

  const handleBarberSelect = (barber) => {
    setBooking((prev) => ({ ...prev, barber }));
    goTo(2);
  };

  const handleDateTimeSelect = ({ date, time, dayLabel }) => {
    setBooking((prev) => ({ ...prev, date, time, dayLabel }));
    goTo(3);
  };

  const handleClientSubmit = async ({ clientName, clientPhone, clientEmail }) => {
    const finalBooking = { ...booking, clientName, clientPhone, clientEmail };

    // Persiste el turno usando el servicio
    await createAppointment({
      barberId: finalBooking.barber.id,
      serviceId: finalBooking.service.id,
      date: finalBooking.date,
      time: finalBooking.time,
      clientName,
      clientPhone,
      clientEmail,
      durationMinutes: finalBooking.service.duration,
    });

    // Enviar email de confirmación
    try {
      const emailResult = await sendBookingConfirmationEmail(
        finalBooking,
        BUSINESS_NAME,
        BUSINESS_ADDRESS
      );
      
      if (emailResult.success) {
        console.log('Email enviado exitosamente:', emailResult);
        setEmailSent(true);
      } else {
        console.error('Error enviando email:', emailResult.error);
        // No bloqueamos el flujo si falla el email
      }
    } catch (error) {
      console.error('Error en el proceso de envío de email:', error);
      // No bloqueamos el flujo si falla el email
    }

    // Sincronizar con Google Calendar (admin + barbero)
    try {
      const calendarResult = await syncAppointmentWithCalendars(
        finalBooking,
        BUSINESS_NAME
      );
      
      if (calendarResult.success) {
        console.log('Calendarios sincronizados:', calendarResult);
        setCalendarSynced(true);
      } else {
        console.error('Error sincronizando calendarios:', calendarResult.errors);
        // No bloqueamos el flujo si falla la sincronización
      }
    } catch (error) {
      console.error('Error en el proceso de sincronización de calendarios:', error);
      // No bloqueamos el flujo si falla la sincronización
    }

    setBooking(finalBooking);
    goTo(4);
  };

  const handleNewBooking = () => {
    setBooking({});
    setEmailSent(false);
    setCalendarSynced(false);
    goTo(0);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-950">
      {/* Encabezado de marca, fijo arriba */}
      <header className="px-4 pt-6 pb-4 sticky top-0 bg-slate-950/95 backdrop-blur z-10 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <Scissors size={16} className="text-amber-500" />
          </div>
          <div>
            <h1 className="font-display text-lg leading-none text-white">{BUSINESS_NAME}</h1>
            <p className="text-[11px] text-slate-400">Reservá tu turno en 1 minuto</p>
          </div>
        </div>
        {step < 4 && <StepIndicator steps={STEP_LABELS} currentStep={step} />}
      </header>

      {/* Contenido del paso actual */}
      <main className="flex-1 px-4 pb-10">
        {step === 0 && <ServiceStep services={services} onSelect={handleServiceSelect} />}

        {step === 1 && (
          <BarberStep
            barbers={barbers}
            selectedService={booking.service}
            onSelect={handleBarberSelect}
            onBack={() => goTo(0)}
          />
        )}

        {step === 2 && (
          <DateTimeStep
            selectedBarber={booking.barber}
            selectedService={booking.service}
            onSelect={handleDateTimeSelect}
            onBack={() => goTo(1)}
          />
        )}

        {step === 3 && (
          <ClientFormStep onSubmit={handleClientSubmit} onBack={() => goTo(2)} />
        )}

        {step === 4 && (
          <ConfirmationStep
            booking={booking}
            businessName={BUSINESS_NAME}
            businessAddress={BUSINESS_ADDRESS}
            onNewBooking={handleNewBooking}
            emailSent={emailSent}
            calendarSynced={calendarSynced}
          />
        )}
      </main>
    </div>
  );
}
