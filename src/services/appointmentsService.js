/**
 * Appointments Service
 * --------------------
 * Servicio para gestionar la lógica de negocio de turnos.
 * Conectado a localStorage para persistencia local inmediata entre Cliente y Admin.
 * Preparado para migrar a Supabase en el futuro.
 */

import { SERVICES, BARBERS } from '../data/mockData.js';

const STORAGE_KEY = 'barberia_turnos_appointments';

/**
 * Obtiene los turnos guardados en localStorage o inicializa los de prueba
 */
function loadAppointments() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error al leer turnos de localStorage:', e);
    }
  }

  // Si no hay datos previos, cargamos los datos de prueba iniciales
  const initial = getInitialMockAppointments();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

/**
 * Guarda el arreglo actualizado de turnos en localStorage
 */
function saveAppointments(appointments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

/**
 * Genera datos de prueba iniciales
 */
function getInitialMockAppointments() {
  const todayISO = new Date().toISOString().slice(0, 10);
  return [
    {
      id: 'apt-1',
      barberId: 'juan',
      serviceId: 'corte',
      date: todayISO,
      time: '10:00',
      clientName: 'Lucas Fernández',
      clientPhone: '+54 9 11 5555-1234',
      clientEmail: 'lucas@email.com',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-2',
      barberId: 'juan',
      serviceId: 'combo',
      date: todayISO,
      time: '11:00',
      clientName: 'Bruno Ledesma',
      clientPhone: '+54 9 11 5555-5678',
      clientEmail: 'bruno@email.com',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-3',
      barberId: 'martin',
      serviceId: 'color',
      date: todayISO,
      time: '14:00',
      clientName: 'Carla Núñez',
      clientPhone: '+54 9 11 5555-9012',
      clientEmail: 'carla@email.com',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Obtiene todos los turnos
 */
export async function getAppointments() {
  return loadAppointments();
}

/**
 * Obtiene turnos filtrados por criterios
 */
export async function getAppointmentsByFilter(filters = {}) {
  let filtered = loadAppointments();
  
  if (filters.barberId) {
    filtered = filtered.filter(apt => apt.barberId === filters.barberId);
  }
  
  if (filters.date) {
    filtered = filtered.filter(apt => apt.date === filters.date);
  }
  
  if (filters.status) {
    filtered = filtered.filter(apt => apt.status === filters.status);
  }
  
  return filtered;
}

/**
 * Crea un nuevo turno y lo guarda de forma permanente en el navegador
 */
export async function createAppointment(appointmentData) {
  const currentAppointments = loadAppointments();
  
  const newAppointment = {
    ...appointmentData,
    id: `apt-${Date.now()}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  
  const updated = [...currentAppointments, newAppointment];
  saveAppointments(updated);
  
  return newAppointment;
}

/**
 * Cancela un turno y actualiza la memoria
 */
export async function cancelAppointment(appointmentId) {
  const currentAppointments = loadAppointments();
  
  const updated = currentAppointments.map((apt) =>
    apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
  );
  
  saveAppointments(updated);
  return true;
}

/**
 * Obtiene servicios disponibles
 */
export function getServices() {
  return SERVICES;
}

/**
 * Obtiene barberos disponibles
 */
export function getBarbers() {
  return BARBERS;
}

/**
 * Obtiene un barbero por ID
 */
export function getBarberById(barberId) {
  return BARBERS.find(b => b.id === barberId);
}

/**
 * Obtiene un servicio por ID
 */
export function getServiceById(serviceId) {
  return SERVICES.find(s => s.id === serviceId);
}

/**
 * Inicializa datos de ejemplo (reinicia localStorage)
 */
export function initializeMockData() {
  const initial = getInitialMockAppointments();
  saveAppointments(initial);
  return initial;
}