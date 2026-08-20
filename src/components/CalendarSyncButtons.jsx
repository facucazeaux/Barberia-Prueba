import React from 'react';
import { CalendarPlus, Download } from 'lucide-react';
import { buildGoogleCalendarUrl, buildICSContent, downloadICSFile } from '../utils/calendar.js';
import Button from './shared/Button.jsx';

/**
 * CalendarSyncButtons
 * --------------------
 * Componente reutilizable que muestra dos acciones para agregar un
 * evento al calendario del usuario:
 *   1. "Agregar a Google Calendar" -> abre una URL con el evento precargado.
 *   2. "Descargar .ics" -> genera y descarga un archivo compatible con
 *      Apple Calendar, Outlook y el calendario nativo del celular.
 *
 * Se usa tanto en la confirmación del cliente como, potencialmente,
 * en cualquier lugar donde se necesite ofrecer sincronizar un evento.
 *
 * Props:
 *  - title, description, location: texto del evento
 *  - date: 'YYYY-MM-DD'
 *  - time: 'HH:mm'
 *  - durationMinutes: número
 */
export default function CalendarSyncButtons({
  title,
  description,
  location,
  date,
  time,
  durationMinutes,
}) {
  const eventData = { title, description, location, date, time, durationMinutes };

  const handleGoogleCalendar = () => {
    const url = buildGoogleCalendarUrl(eventData);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadICS = () => {
    const ics = buildICSContent(eventData);
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadICSFile(ics, `${safeTitle}.ics`);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide">
        Agregar a mi calendario
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Button variant="outline" icon={CalendarPlus} fullWidth onClick={handleGoogleCalendar}>
          Google Calendar
        </Button>
        <Button variant="outline" icon={Download} fullWidth onClick={handleDownloadICS}>
          Descargar .ics
        </Button>
      </div>
      <p className="text-[11px] text-ink-600">
        El archivo .ics funciona con Apple Calendar, Outlook y el calendario de tu celular.
      </p>
    </div>
  );
}
