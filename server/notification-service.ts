import { db } from "./db";
import { appointments, clients, services, staff, notificationSettings, notificationLog } from "@shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { sendAppointmentConfirmation, sendAppointmentReminder } from "./email-service";
import { format, addDays, parseISO } from "date-fns";

export async function sendAppointmentNotification(
  appointmentId: string, 
  type: 'confirmation' | 'reminder'
): Promise<boolean> {
  try {
    // Get appointment with related data
    const appointment = await db
      .select({
        appointment: appointments,
        client: clients,
        service: services,
        staff: staff,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment[0]) {
      console.error(`Appointment not found: ${appointmentId}`);
      return false;
    }

    const { appointment: appt, client, service, staff: staffMember } = appointment[0];

    if (!client?.email) {
      console.error(`Client email not found for appointment: ${appointmentId}`);
      return false;
    }

    // Get notification settings
    const settings = await db
      .select()
      .from(notificationSettings)
      .limit(1);

    const spaSettings = settings[0] || {
      spaName: "JustPause Salon & Spa",
      spaEmail: "noreply@justpause.ph",
      emailEnabled: true,
      confirmationEnabled: true,
      reminderEnabled: true,
    };

    // Check if this type of notification is enabled
    if (type === 'confirmation' && !spaSettings.confirmationEnabled) {
      return false;
    }
    if (type === 'reminder' && !spaSettings.reminderEnabled) {
      return false;
    }
    if (!spaSettings.emailEnabled) {
      return false;
    }

    // Format appointment date and time
    const appointmentDate = format(parseISO(appt.date), 'MMMM dd, yyyy');
    const appointmentTime = appt.time;

    const emailData = {
      clientName: client.name,
      clientEmail: client.email,
      serviceName: service?.name || 'Service',
      appointmentDate,
      appointmentTime,
      staffName: staffMember?.name || 'Our team',
      spaName: spaSettings.spaName,
      spaEmail: spaSettings.spaEmail,
    };

    // Send email
    let success = false;
    if (type === 'confirmation') {
      success = await sendAppointmentConfirmation(emailData);
    } else {
      success = await sendAppointmentReminder(emailData);
    }

    // Log the notification attempt
    await db.insert(notificationLog).values({
      appointmentId,
      type,
      method: 'email',
      status: success ? 'sent' : 'failed',
      sentAt: success ? new Date() : undefined,
      errorMessage: success ? undefined : 'Failed to send email',
    });

    return success;
  } catch (error) {
    console.error(`Error sending ${type} notification:`, error);
    
    // Log the error
    await db.insert(notificationLog).values({
      appointmentId,
      type,
      method: 'email',
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return false;
  }
}

export async function sendPendingReminders(): Promise<void> {
  try {
    // Get notification settings
    const settings = await db
      .select()
      .from(notificationSettings)
      .limit(1);

    const spaSettings = settings[0];
    if (!spaSettings?.reminderEnabled) {
      return;
    }

    const reminderHours = spaSettings.reminderHours || 24;
    
    // Calculate the target date for reminders (e.g., tomorrow for 24-hour reminders)
    const targetDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    
    // Find appointments that need reminders
    const appointmentsNeedingReminders = await db
      .select({
        appointment: appointments,
        client: clients,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .where(
        and(
          eq(appointments.date, targetDate),
          eq(appointments.status, 'confirmed')
        )
      );

    // Check which appointments haven't received reminders yet
    for (const { appointment: appt } of appointmentsNeedingReminders) {
      const existingReminder = await db
        .select()
        .from(notificationLog)
        .where(
          and(
            eq(notificationLog.appointmentId, appt.id),
            eq(notificationLog.type, 'reminder'),
            eq(notificationLog.status, 'sent')
          )
        )
        .limit(1);

      if (existingReminder.length === 0) {
        await sendAppointmentNotification(appt.id, 'reminder');
      }
    }
  } catch (error) {
    console.error('Error sending pending reminders:', error);
  }
}

// Run this function periodically (e.g., every hour) to send reminders
export function startReminderScheduler(): void {
  // Send reminders every hour
  setInterval(sendPendingReminders, 60 * 60 * 1000);
  
  // Send initial batch on startup
  setTimeout(sendPendingReminders, 5000);
}