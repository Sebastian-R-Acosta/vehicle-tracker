import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = "Vehicle Tracker <onboarding@resend.dev>";

interface VehicleReminder {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  dueMileage: number | null;
  dueHours: number | null;
  vehicle: {
    nickname: string | null;
    make: string;
    model: string;
    year: number;
    currentMileage: number;
  };
}

export async function sendReminderEmail(
  to: string,
  reminders: VehicleReminder[]
) {
  const overdueReminders = reminders.filter(
    (r) => r.dueDate && new Date(r.dueDate) <= new Date()
  );
  const upcomingReminders = reminders.filter(
    (r) => r.dueDate && new Date(r.dueDate) > new Date()
  );
  const mileageReminders = reminders.filter(
    (r) => r.dueMileage && r.dueMileage <= r.vehicle.currentMileage + 1000
  );

  const html = generateReminderEmailHtml(overdueReminders, upcomingReminders, mileageReminders);

  if (overdueReminders.length === 0 && upcomingReminders.length === 0 && mileageReminders.length === 0) {
    return { success: false, message: "No reminders to send" };
  }

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: `Vehicle Reminders Update - ${new Date().toLocaleDateString()}`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function sendMaintenanceConfirmation(
  to: string,
  vehicle: { make: string; model: string; year: number; nickname: string | null },
  maintenance: { serviceType: string; date: Date; mileage: number; notes: string | null }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .vehicle-name { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 20px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .label { color: #6b7280; }
        .value { font-weight: 600; }
        .notes { background: white; padding: 15px; border-radius: 6px; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Maintenance Logged</h1>
        </div>
        <div class="content">
          <div class="vehicle-name">
            ${vehicle.year} ${vehicle.make} ${vehicle.model}
            ${vehicle.nickname ? `(${vehicle.nickname})` : ""}
          </div>
          <div class="detail-row">
            <span class="label">Service Type</span>
            <span class="value">${maintenance.serviceType}</span>
          </div>
          <div class="detail-row">
            <span class="label">Date</span>
            <span class="value">${new Date(maintenance.date).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="label">Mileage</span>
            <span class="value">${maintenance.mileage.toLocaleString()} mi</span>
          </div>
          ${maintenance.notes ? `<div class="notes"><strong>Notes:</strong><br>${maintenance.notes}</div>` : ""}
        </div>
        <div class="footer">
          Vehicle Tracker - Keep your vehicles in top shape
        </div>
      </div>
    </body>
    </html>
  `;

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: `Maintenance Logged: ${maintenance.serviceType} - ${vehicle.make} ${vehicle.model}`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function sendReminderCreatedEmail(
  to: string,
  reminder: {
    title: string;
    description: string | null;
    dueDate: Date | null;
    dueMileage: number | null;
    dueHours: number | null;
    vehicle: { make: string; model: string; year: number; nickname: string | null };
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .reminder-title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 15px; }
        .vehicle-name { font-size: 16px; color: #4b5563; margin-bottom: 20px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .label { color: #6b7280; }
        .value { font-weight: 600; }
        .description { background: white; padding: 15px; border-radius: 6px; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reminder Created</h1>
        </div>
        <div class="content">
          <div class="reminder-title">${reminder.title}</div>
          <div class="vehicle-name">
            ${reminder.vehicle.year} ${reminder.vehicle.make} ${reminder.vehicle.model}
            ${reminder.vehicle.nickname ? `(${reminder.vehicle.nickname})` : ""}
          </div>
          <div class="detail-row">
            <span class="label">Due Date</span>
            <span class="value">${reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString() : "Not set"}</span>
          </div>
          <div class="detail-row">
            <span class="label">Due Mileage</span>
            <span class="value">${reminder.dueMileage ? `${reminder.dueMileage.toLocaleString()} mi` : "Not set"}</span>
          </div>
          <div class="detail-row">
            <span class="label">Due Hours</span>
            <span class="value">${reminder.dueHours ? `${reminder.dueHours.toLocaleString()} hrs` : "Not set"}</span>
          </div>
          ${reminder.description ? `<div class="description"><strong>Notes:</strong><br>${reminder.description}</div>` : ""}
        </div>
        <div class="footer">
          Vehicle Tracker - You'll receive an email when this reminder is due
        </div>
      </div>
    </body>
    </html>
  `;

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: `Reminder Created: ${reminder.title}`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function sendReminderDueEmail(
  to: string,
  reminder: {
    title: string;
    description: string | null;
    dueDate: Date | null;
    dueMileage: number | null;
    vehicle: { make: string; model: string; year: number; nickname: string | null; currentMileage: number };
  }
) {
  const isOverdue = reminder.dueDate && new Date(reminder.dueDate) < new Date();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isOverdue ? "#ef4444" : "#f59e0b"}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .reminder-title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 15px; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 15px; }
        .status.overdue { background: #fef2f2; color: #ef4444; }
        .status.due { background: #fef3c7; color: "#f59e0b"; }
        .vehicle-name { font-size: 16px; color: #4b5563; margin-bottom: 20px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .label { color: #6b7280; }
        .value { font-weight: 600; }
        .current-mileage { background: white; padding: 15px; border-radius: 6px; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isOverdue ? "Reminder Overdue!" : "Reminder Due"}</h1>
        </div>
        <div class="content">
          <div>
            <span class="status ${isOverdue ? "overdue" : "due"}">
              ${isOverdue ? "OVERDUE" : "Due Soon"}
            </span>
          </div>
          <div class="reminder-title">${reminder.title}</div>
          <div class="vehicle-name">
            ${reminder.vehicle.year} ${reminder.vehicle.make} ${reminder.vehicle.model}
            ${reminder.vehicle.nickname ? `(${reminder.vehicle.nickname})` : ""}
          </div>
          <div class="detail-row">
            <span class="label">Due Date</span>
            <span class="value">${reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString() : "Not set"}</span>
          </div>
          <div class="detail-row">
            <span class="label">Due Mileage</span>
            <span class="value">${reminder.dueMileage ? `${reminder.dueMileage.toLocaleString()} mi` : "Not set"}</span>
          </div>
          ${reminder.description ? `<div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;"><strong>Notes:</strong><br>${reminder.description}</div>` : ""}
          <div class="current-mileage">
            <strong>Current Mileage:</strong> ${reminder.vehicle.currentMileage.toLocaleString()} mi
          </div>
        </div>
        <div class="footer">
          Vehicle Tracker - Don't forget to take care of your vehicle!
        </div>
      </div>
    </body>
    </html>
  `;

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: `${isOverdue ? "OVERDUE: " : "Reminder: "}${reminder.title}`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

function generateReminderEmailHtml(
  overdue: VehicleReminder[],
  upcoming: VehicleReminder[],
  mileage: VehicleReminder[]
) {
  const reminderSection = (title: string, items: VehicleReminder[], icon: string) => {
    if (items.length === 0) return "";

    return `
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">
          ${icon} ${title}
        </h3>
        ${items.map((r) => `
          <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #ef4444;">
            <strong>${r.title}</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280;">
              ${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model}
              ${r.vehicle.nickname ? `(${r.vehicle.nickname})` : ""}
            </p>
            ${r.description ? `<p style="margin: 5px 0; font-size: 14px;">${r.description}</p>` : ""}
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #374151;">
              ${r.dueDate ? `Due: ${new Date(r.dueDate).toLocaleDateString()}` : ""}
              ${r.dueMileage ? `Due at: ${r.dueMileage.toLocaleString()} mi` : ""}
            </p>
          </div>
        `).join("")}
      </div>
    `;
  };

  const hasContent = overdue.length > 0 || upcoming.length > 0 || mileage.length > 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .summary { background: white; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center; }
        .summary-number { font-size: 36px; font-weight: bold; color: #2563eb; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Vehicle Reminders</h1>
          <p style="margin: 0; opacity: 0.9;">${new Date().toLocaleDateString()}</p>
        </div>
        <div class="content">
          <div class="summary">
            <div class="summary-number">${overdue.length + mileage.length}</div>
            <div>reminders need your attention</div>
          </div>
          ${overdue.length > 0 ? reminderSection("Overdue", overdue, "⚠️") : ""}
          ${mileage.length > 0 ? reminderSection("Due by Mileage", mileage, "📏") : ""}
          ${upcoming.length > 0 ? reminderSection("Upcoming This Week", upcoming, "📅") : ""}
          ${!hasContent ? "<p>No reminders at this time. Your vehicles are in good shape!</p>" : ""}
        </div>
        <div class="footer">
          Vehicle Tracker - Keep your vehicles in top shape
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendWelcomeEmail(to: string, name?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
        .feature { background: white; padding: 12px; border-radius: 8px; text-align: center; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welcome to Vehicle Tracker</h1>
        </div>
        <div class="content">
          <p>Hi ${name || "there"},</p>
          <p>Thanks for signing up! You now have a free account with 2 vehicle slots.</p>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/onboarding" class="button">Get Started</a>
          </div>
          <div class="features">
            <div class="feature">Track 2 vehicles free</div>
            <div class="feature">Maintenance logging</div>
            <div class="feature">Smart reminders</div>
            <div class="feature">PDF reports</div>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            Upgrade to Pro anytime for unlimited vehicles and premium features.
          </p>
        </div>
        <div class="footer">
          Vehicle Tracker &mdash; Your vehicle history platform
        </div>
      </div>
    </body>
    </html>
  `;

  if (!process.env.RESEND_API_KEY) return { success: false };

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: "Welcome to Vehicle Tracker",
    html,
  });

  if (error) console.error("Resend error:", error);
  return { success: !error, data };
}

export async function sendPasswordResetEmail(
  to: string,
  data: { resetUrl: string; userName: string }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #b91c1c; }
        .warning { background: #fef3c7; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${data.userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${data.resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; font-size: 14px; color: #6b7280;">${data.resetUrl}</p>
          <div class="warning">
            <strong>⚠️ This link expires in 1 hour.</strong><br />
            If you didn't request this, you can safely ignore this email. Your password won't be changed.
          </div>
        </div>
        <div class="footer">
          Vehicle Tracker - Your vehicle management app
        </div>
      </div>
    </body>
    </html>
  `;

  const { data: result, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: "Reset Your Password - Vehicle Tracker",
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error };
  }

  return { success: true, data: result };
}

export async function sendDemoRequestEmail(
  to: string,
  data: { name: string; email: string; company: string; phone: string; message: string }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 16px; }
        .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .value { font-size: 16px; color: #1f2937; font-weight: 500; }
        .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">New Demo Request</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">${data.company}</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name</div>
            <div class="value">${data.name}</div>
          </div>
          <div class="field">
            <div class="label">Email</div>
            <div class="value">${data.email}</div>
          </div>
          <div class="field">
            <div class="label">Company</div>
            <div class="value">${data.company}</div>
          </div>
          <div class="field">
            <div class="label">Phone</div>
            <div class="value">${data.phone || "Not provided"}</div>
          </div>
          ${data.message ? `<hr class="divider" /><div class="field"><div class="label">Message</div><div class="value">${data.message}</div></div>` : ""}
        </div>
        <div class="footer">
          Vehicle Tracker - Demo Request Notification
        </div>
      </div>
    </body>
    </html>
  `;

  const { data: result, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: `New Demo Request from ${data.name} at ${data.company}`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error };
  }

  return { success: true, data: result };
}