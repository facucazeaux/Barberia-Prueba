/**
 * Appointments Service
 * --------------------
 * Servicio para gestionar la lógica de negocio de turnos.
 * Conectado directamente a Supabase (PostgreSQL).
 */

import { supabase } from '../lib/supabase.js';

/**
 * Mapea un registro de Supabase (snake_case) al formato del Frontend (camelCase)
 */
function mapAppointmentFromDB(apt) {
  if (!apt) return null;
  return {
    id: apt.id,
    barberId: apt.barber_id,
    serviceId: apt.service_id,
    date: apt.date,
    time: apt.time?.slice(0, 5) || apt.time, // Formato "HH:MM"
    clientName: apt.client_name,
    clientPhone: apt.client_phone,
    clientEmail: apt.client_email,
    status: apt.status,
    createdAt: apt.created_at,
  };
}

/**
 * Obtiene todos los turnos ordenados por fecha y hora
 */
export async function getAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('Error al obtener turnos de Supabase:', error);
    return [];
  }

  return data.map(mapAppointmentFromDB);
}

/**
 * Obtiene turnos filtrados por criterios (barbero, fecha, estado)
 */
export async function getAppointmentsByFilter(filters = {}) {
  let query = supabase.from('appointments').select('*');

  if (filters.barberId) {
    query = query.eq('barber_id', filters.barberId);
  }

  if (filters.date) {
    query = query.eq('date', filters.date);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('Error al filtrar turnos:', error);
    return [];
  }

  return data.map(mapAppointmentFromDB);
}

/**
 * Crea un nuevo turno en la base de datos de Supabase
 */
export async function createAppointment(appointmentData) {
  const dbPayload = {
    barber_id: appointmentData.barberId,
    service_id: appointmentData.serviceId,
    date: appointmentData.date,
    time: appointmentData.time,
    client_name: appointmentData.clientName,
    client_phone: appointmentData.clientPhone,
    client_email: appointmentData.clientEmail,
    status: 'confirmed',
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error('Error al crear el turno en Supabase:', error);
    throw new Error('No se pudo guardar la reserva');
  }

  return mapAppointmentFromDB(data);
}

/**
 * Cancela un turno actualizando su estado en la base de datos
 */
export async function cancelAppointment(appointmentId) {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (error) {
    console.error('Error al cancelar el turno en Supabase:', error);
    return false;
  }

  return true;
}

/**
 * Obtiene la lista de servicios desde Supabase
 */
export async function getServices() {
  const { data, error } = await supabase.from('services').select('*');
  if (error) {
    console.error('Error al obtener servicios:', error);
    return [];
  }
  return data;
}

/**
 * Obtiene la lista de barberos desde Supabase
 */
export async function getBarbers() {
  const { data, error } = await supabase.from('barbers').select('*');
  if (error) {
    console.error('Error al obtener barberos:', error);
    return [];
  }
  return data;
}

/**
 * Obtiene un barbero por ID desde Supabase
 */
export async function getBarberById(barberId) {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('id', barberId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Obtiene un servicio por ID desde Supabase
 */
export async function getServiceById(serviceId) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single();

  if (error) return null;
  return data;
}