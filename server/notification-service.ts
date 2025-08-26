import { db } from "./db";
import { appointments, customers, services, staff, notificationSettings, notificationLog } from "@shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { sendAppointmentConfirmation, sendAppointmentReminder, sendAppointmentCancellation } from "./email-service";
import { format, addDays, parseISO } from "date-fns";

export async function sendAppointmentNotification(
  appointmentId: string,
  type: 'confirmation' | 'reminder' | 'cancellation' // Added 'cancellation' to the type union
): Promise<boolean> {
  try {
    // Get appointment with related data
    const appointment = await db
      .select({
        appointment: appointments,
        customer: customers,
        service: services,
        staff: staff,
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment[0]) {
      console.error(`Appointment not found: ${appointmentId}`);
      return false;
    }

    const { appointment: appt, customer, service, staff: staffMember } = appointment[0];

    if (!customer?.email) {
      console.error(`Customer email not found for appointment: ${appointmentId}`);
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
      clientName: customer.name,
      clientEmail: customer.email,
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
    } else if (type === 'reminder') {
      success = await sendAppointmentReminder(emailData);
    } else if (type === 'cancellation') { // Handle cancellation specifically
      success = await sendAppointmentCancellation(emailData);
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

    // The reminderHours should be directly accessible from spaSettings if it exists
    const reminderHours = spaSettings.reminderHours || 24; 

    const now = new Date();
    // Calculate the target time for reminders
    const reminderTime = new Date(now.getTime() + reminderHours * 60 * 60 * 1000);

    // Find appointments that need reminders
    const appointmentsNeedingReminders = await db
      .select({
        id: appointments.id,
        customerId: appointments.customerId,
        date: appointments.date,
        time: appointments.time,
        serviceName: services.name,
        customerName: customers.name,
        customerEmail: customers.email,
        staffName: staff.name,
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .where(
        and(
          eq(appointments.status, 'confirmed'),
          // Ensure we are comparing dates correctly
          gte(appointments.date, format(now, 'yyyy-MM-dd')),
          // Check if reminder has already been sent
          sql`NOT EXISTS (
            SELECT 1 FROM notification_log
            WHERE appointment_id = ${appointments.id}
            AND type = 'reminder'
            AND status = 'sent'
          )`
        )
      );

    for (const { id, customerEmail } of appointmentsNeedingReminders) {
      // If customerEmail is available, send the reminder
      if (customerEmail) {
        await sendAppointmentNotification(id, 'reminder');
      } else {
        console.warn(`Skipping reminder for appointment ${id}: Customer email not found.`);
      }
    }
  } catch (error) {
    console.error('Error sending pending reminders:', error);
    // Log the error if possible, though this function doesn't have appointmentId context for logging
  }
}

// Run this function periodically (e.g., every hour) to send reminders
export function startReminderScheduler(): void {
  // Send reminders every hour
  setInterval(sendPendingReminders, 60 * 60 * 1000);

  // Send initial batch on startup
  setTimeout(sendPendingReminders, 5000);
}