import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

interface AppointmentReminderData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  staffName: string;
  spaName: string;
  spaEmail: string;
}

export async function sendAppointmentConfirmation(data: AppointmentReminderData): Promise<boolean> {
  const subject = `Appointment Confirmation - ${data.spaName}`;
  
  const text = `
Dear ${data.clientName},

Your appointment has been confirmed!

Service: ${data.serviceName}
Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
Staff: ${data.staffName}

We look forward to seeing you at ${data.spaName}.

Best regards,
${data.spaName} Team
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #334155;">Appointment Confirmation</h2>
      
      <p>Dear <strong>${data.clientName}</strong>,</p>
      
      <p>Your appointment has been confirmed!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #475569;">Appointment Details</h3>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <p><strong>Date:</strong> ${data.appointmentDate}</p>
        <p><strong>Time:</strong> ${data.appointmentTime}</p>
        <p><strong>Staff:</strong> ${data.staffName}</p>
      </div>
      
      <p>We look forward to seeing you at <strong>${data.spaName}</strong>.</p>
      
      <p>Best regards,<br>${data.spaName} Team</p>
    </div>
  `;

  return sendEmail({
    to: data.clientEmail,
    from: data.spaEmail,
    subject,
    text,
    html,
  });
}

export async function sendAppointmentCancellation(data: AppointmentReminderData): Promise<boolean> {
  const subject = `Appointment Cancelled - ${data.spaName}`;
  
  const text = `
Dear ${data.clientName},

We're sorry to inform you that your appointment has been cancelled.

Cancelled Appointment Details:
Service: ${data.serviceName}
Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
Staff: ${data.staffName}

We apologize for any inconvenience this may cause. Please contact us to reschedule your appointment.

Thank you for your understanding.

Best regards,
${data.spaName} Team
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Appointment Cancelled</h2>
      
      <p>Dear <strong>${data.clientName}</strong>,</p>
      
      <p>We're sorry to inform you that your appointment has been <strong>cancelled</strong>.</p>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #991b1b;">Cancelled Appointment Details</h3>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <p><strong>Date:</strong> ${data.appointmentDate}</p>
        <p><strong>Time:</strong> ${data.appointmentTime}</p>
        <p><strong>Staff:</strong> ${data.staffName}</p>
      </div>
      
      <p>We apologize for any inconvenience this may cause.</p>
      <p><strong>Please contact us to reschedule your appointment.</strong></p>
      
      <p>Thank you for your understanding.</p>
      
      <p>Best regards,<br><strong>${data.spaName} Team</strong></p>
    </div>
  `;

  return sendEmail({
    to: data.clientEmail,
    from: data.spaEmail,
    subject,
    text,
    html,
  });
}

export async function sendAppointmentReminder(data: AppointmentReminderData): Promise<boolean> {
  const subject = `Reminder: Your appointment tomorrow at ${data.spaName}`;
  
  const text = `
Dear ${data.clientName},

This is a friendly reminder about your appointment tomorrow.

Service: ${data.serviceName}
Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
Staff: ${data.staffName}

Please arrive 10 minutes early. If you need to reschedule, please call us as soon as possible.

See you soon!
${data.spaName} Team
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #334155;">Appointment Reminder</h2>
      
      <p>Dear <strong>${data.clientName}</strong>,</p>
      
      <p>This is a friendly reminder about your appointment <strong>tomorrow</strong>.</p>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #92400e;">Appointment Details</h3>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <p><strong>Date:</strong> ${data.appointmentDate}</p>
        <p><strong>Time:</strong> ${data.appointmentTime}</p>
        <p><strong>Staff:</strong> ${data.staffName}</p>
      </div>
      
      <p><strong>Please arrive 10 minutes early.</strong></p>
      <p>If you need to reschedule, please call us as soon as possible.</p>
      
      <p>See you soon!<br><strong>${data.spaName} Team</strong></p>
    </div>
  `;

  return sendEmail({
    to: data.clientEmail,
    from: data.spaEmail,
    subject,
    text,
    html,
  });
}