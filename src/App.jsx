import React, { useEffect, useState } from 'react';
import BookingFlow from './components/booking/BookingFlow.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import AdminLogin, { hasValidAdminSession } from './components/admin/AdminLogin.jsx';

/**
 * App
 * ----
 * Enruta según la URL, SIN ninguna librería de routing (para mantener
 * el proyecto liviano) y sin exponer ningún botón/link público hacia
 * el panel admin:
 *
 *  - "/"       -> Flujo de reserva del cliente (público, sin login).
 *  - "/admin"  -> Panel del dueño, protegido por PIN.
 *
 * El dueño accede escribiendo la URL una sola vez y luego guardando un
 * acceso directo a "/admin" en la pantalla de inicio de su celular
 * (ver README: "Agregar a pantalla de inicio"), quedando como si fuera
 * una app aparte, con su propio ícono y sin barra de navegador.
 */
export default function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const [unlocked, setUnlocked] = useState(isAdminRoute && hasValidAdminSession());

  // Si la sesión guardada expiró mientras la pestaña estaba abierta,
  // vuelve a pedir el PIN sin recargar la página.
  useEffect(() => {
    if (!isAdminRoute) return;
    const interval = setInterval(() => {
      if (!hasValidAdminSession()) setUnlocked(false);
    }, 60_000);
    return () => clearInterval(interval);
  }, [isAdminRoute]);

  if (!isAdminRoute) {
    return <BookingFlow />;
  }

  if (!unlocked) {
    return <AdminLogin onSuccess={() => setUnlocked(true)} />;
  }

  return <AdminDashboard />;
}
