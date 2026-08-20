/**
 * Email Service
 * -------------
 * Servicio para enviar emails de confirmación de turnos a los clientes.
 * Implementado con Resend para producción, con fallback simulado para desarrollo.
 * 
 * Para usar en producción:
 * 1. Instalar: npm install resend
 * 2. Configurar VITE_RESEND_API_KEY en .env
 * 3. El sistema enviará emails reales de confirmación
 */

import { Resend } from 'resend';

// Inicialización de Resend (solo si está configurada la API key)
let resend = null;
if (import.meta.env.VITE_RESEND_API_KEY) {
  resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
}

/**
 * Envía un email de confirmación de turno al cliente
 * @param {Object} bookingData - Datos del turno
 * @param {string} bookingData.clientName - Nombre del cliente
 * @param {string} bookingData.clientEmail - Email del cliente
 * @param {string} bookingData.clientPhone - Teléfono del cliente
 * @param {Object} bookingData.service - Servicio contratado
 * @param {Object} bookingData.barber - Barbero asignado
 * @param {string} bookingData.date - Fecha del turno (YYYY-MM-DD)
 * @param {string} bookingData.time - Hora del turno (HH:mm)
 * @param {string} businessName - Nombre del negocio
 * @param {string} businessAddress - Dirección del negocio
 */
export async function sendBookingConfirmationEmail(bookingData, businessName, businessAddress) {
  const {
    clientName,
    clientEmail,
    clientPhone,
    service,
    barber,
    date,
    time,
    dayLabel
  } = bookingData;

  // Formatear fecha para mostrar
  const formattedDate = `${dayLabel.weekdayLabel} ${dayLabel.dayNumber} de ${dayLabel.monthLabel}`;

  // Crear contenido HTML del email
  const emailContent = {
    from: 'noreply@barberia.com', // Configurar dominio real en producción
    to: clientEmail,
    subject: `Confirmación de turno - ${businessName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Turno</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #0f172a;
              color: #f1f5f9;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #1e293b;
              border-radius: 12px;
              padding: 30px;
              border: 1px solid #334155;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 1px solid #334155;
            }
            .header h1 {
              color: #f59e0b;
              margin: 0;
              font-size: 24px;
            }
            .content {
              margin-bottom: 30px;
            }
            .detail-row {
              display: flex;
              margin-bottom: 15px;
              padding: 12px;
              background-color: #0f172a;
              border-radius: 8px;
            }
            .detail-label {
              font-weight: bold;
              color: #94a3b8;
              width: 120px;
              flex-shrink: 0;
            }
            .detail-value {
              color: #f1f5f9;
            }
            .footer {
              text-align: center;
              color: #64748b;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #334155;
            }
            .highlight {
              color: #f59e0b;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✂️ Turno Confirmado</h1>
              <p>${businessName}</p>
            </div>
            
            <div class="content">
              <p style="margin-bottom: 20px;">
                Hola <span class="highlight">${clientName}</span>, tu turno ha sido confirmado exitosamente.
              </p>
              
              <div class="detail-row">
                <div class="detail-label">Servicio:</div>
                <div class="detail-value">${service.name}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Profesional:</div>
                <div class="detail-value">${barber.name}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Fecha:</div>
                <div class="detail-value">${formattedDate}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Horario:</div>
                <div class="detail-value">${time} hs</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Duración:</div>
                <div class="detail-value">${service.duration} minutos</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Dirección:</div>
                <div class="detail-value">${businessAddress}</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Te esperamos en ${businessName}</p>
              <p>Si necesitas cancelar o modificar tu turno, contáctanos por teléfono.</p>
              <p style="margin-top: 10px;">Teléfono de contacto: ${clientPhone}</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    if (resend) {
      // Enviar email real usando Resend
      const { data, error } = await resend.emails.send(emailContent);
      
      if (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } else {
      // Fallback para desarrollo: simular envío
      console.log('📧 [DEV MODE] Email de confirmación simulado:', {
        to: clientEmail,
        subject: emailContent.subject,
        bookingDetails: {
          client: clientName,
          service: service.name,
          barber: barber.name,
          date: formattedDate,
          time: time
        }
      });
      
      return { 
        success: true, 
        simulated: true, 
        message: 'Email simulado en modo desarrollo (configura VITE_RESEND_API_KEY para envío real)' 
      };
    }
  } catch (error) {
    console.error('Error en emailService:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Versión alternativa usando Nodemailer (para backend)
 * Esta función sería usada si decides implementar un backend con Express
 */
export async function sendBookingConfirmationEmailNodemailer(bookingData, businessName, businessAddress) {
  // Esta función requeriría un backend con Nodemailer configurado
  // Por ahora solo está como placeholder para futura implementación
  
  console.log('📧 [Nodemailer] Email service requiere backend implementation');
  return { 
    success: false, 
    error: 'Nodemailer requiere implementación de backend' 
  };
}