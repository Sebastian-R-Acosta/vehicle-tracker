import { Resend } from "resend";

let resendWarned = false;

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    if (!resendWarned) {
      console.warn("[email] RESEND_API_KEY is not set — emails will not be sent");
      resendWarned = true;
    }
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FREE_EMAIL_PROVIDERS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "mail.com", "protonmail.com", "proton.me", "zoho.com", "yandex.com"];

function getFromEmail(): string {
  const raw = process.env.FROM_EMAIL_ADDRESS;
  if (!raw) return "Bitácora <onboarding@resend.dev>";

  const domain = raw.includes("@") ? raw.split("@")[1].toLowerCase() : "";
  if (FREE_EMAIL_PROVIDERS.includes(domain)) {
    console.warn(`[email] FROM_EMAIL_ADDRESS "${raw}" uses a free email provider — Resend requires a verified domain. Falling back to onboarding@resend.dev`);
    return "Bitácora <onboarding@resend.dev>";
  }

  return `Bitácora <${raw}>`;
}

const fromEmail = getFromEmail();

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function sendViaResend(to: string, subject: string, html: string) {
  const r = getResend();
  if (!r) {
    console.error("[email] Cannot send — RESEND_API_KEY is not configured");
    return { success: false, error: new Error("Resend not configured") };
  }

  const { data, error } = await r.emails.send({
    from: fromEmail,
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error(`[email] FAILED to send "${subject}" to ${to}:`, JSON.stringify(error));
    return { success: false, error };
  }

  console.log(`[email] Sent "${subject}" to ${to}`);
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
            <span class="value">${escapeHtml(maintenance.serviceType)}</span>
          </div>
          <div class="detail-row">
            <span class="label">Date</span>
            <span class="value">${new Date(maintenance.date).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="label">Mileage</span>
            <span class="value">${maintenance.mileage.toLocaleString()} mi</span>
          </div>
          ${maintenance.notes ? `<div class="notes"><strong>Notes:</strong><br>${escapeHtml(maintenance.notes)}</div>` : ""}
        </div>
        <div class="footer">
          Bitácora - Keep your vehicles in top shape
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, `Maintenance Logged: ${maintenance.serviceType} - ${vehicle.make} ${vehicle.model}`, html);
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
          <div class="reminder-title">${escapeHtml(reminder.title)}</div>
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
          ${reminder.description ? `<div class="description"><strong>Notes:</strong><br>${escapeHtml(reminder.description)}</div>` : ""}
        </div>
        <div class="footer">
          Bitácora - You'll receive an email when this reminder is due
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, `Reminder Created: ${reminder.title}`, html);
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
        .status.due { background: #fef3c7; color: #f59e0b; }
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
          <div class="reminder-title">${escapeHtml(reminder.title)}</div>
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
          ${reminder.description ? `<div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;"><strong>Notes:</strong><br>${escapeHtml(reminder.description)}</div>` : ""}
          <div class="current-mileage">
            <strong>Current Mileage:</strong> ${reminder.vehicle.currentMileage.toLocaleString()} mi
          </div>
        </div>
        <div class="footer">
          Bitácora - Don't forget to take care of your vehicle!
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, `${isOverdue ? "OVERDUE: " : "Reminder: "}${reminder.title}`, html);
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
          <h1 style="margin: 0;">Welcome to Bitácora</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(name || "there")},</p>
          <p>Thanks for signing up! You now have a free account with 2 vehicle slots.</p>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/onboarding" class="button">Get Started</a>
          </div>
          <div class="features">
            <div class="feature">Track 2 vehicles free</div>
            <div class="feature">Maintenance logging</div>
            <div class="feature">Smart reminders</div>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            Upgrade to Pro anytime for unlimited vehicles and premium features.
          </p>
        </div>
        <div class="footer">
          Bitácora &mdash; Your vehicle history platform
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, "Welcome to Bitácora", html);
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
          <p>Hi ${escapeHtml(data.userName)},</p>
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
          Bitácora - Your vehicle management app
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, "Reset Your Password - Bitácora", html);
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
          <p style="margin: 8px 0 0; opacity: 0.9;">${escapeHtml(data.company)}</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name</div>
            <div class="value">${escapeHtml(data.name)}</div>
          </div>
          <div class="field">
            <div class="label">Email</div>
            <div class="value">${escapeHtml(data.email)}</div>
          </div>
          <div class="field">
            <div class="label">Company</div>
            <div class="value">${escapeHtml(data.company)}</div>
          </div>
          <div class="field">
            <div class="label">Phone</div>
            <div class="value">${escapeHtml(data.phone || "Not provided")}</div>
          </div>
          ${data.message ? `<hr class="divider" /><div class="field"><div class="label">Message</div><div class="value">${escapeHtml(data.message)}</div></div>` : ""}
        </div>
        <div class="footer">
          Bitácora - Demo Request Notification
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, `New Demo Request from ${data.name} at ${data.company}`.replace(/<[^>]*>/g, ""), html);
}

export async function sendPasswordChangedEmail(to: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .warning { background: #fef3c7; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Changed</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(userName)},</p>
          <p>Your password has been successfully changed. If this was you, no further action is needed.</p>
          <div class="warning">
            <strong>If you didn't make this change,</strong> please reset your password immediately or contact support.
          </div>
        </div>
        <div class="footer">
          Bitácora - Your vehicle management app
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, "Your Password Was Changed - Bitácora", html);
}

export async function sendNewLoginEmail(
  to: string,
  userName: string,
  metadata?: { method?: string; timestamp?: string }
) {
  const method = metadata?.method || "credentials";
  const timestamp = metadata?.timestamp || new Date().toLocaleString();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .detail { background: white; padding: 12px; border-radius: 6px; margin: 15px 0; font-size: 14px; }
        .warning { background: #fef3c7; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Sign-In Detected</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(userName)},</p>
          <p>We noticed a new sign-in to your Bitácora account.</p>
          <div class="detail">
            <strong>Method:</strong> ${escapeHtml(method)}<br />
            <strong>Time:</strong> ${escapeHtml(timestamp)}
          </div>
          <div class="warning">
            If this wasn't you, please change your password immediately.
          </div>
        </div>
        <div class="footer">
          Bitácora - Your vehicle management app
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, "New Sign-In to Your Bitácora Account", html);
}

export async function sendSubscriptionActivatedEmail(
  to: string,
  userName: string,
  planName: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .plan-badge { display: inline-block; background: #ede9fe; color: #7c3aed; padding: 6px 16px; border-radius: 9999px; font-weight: 600; margin: 15px 0; }
        .features { margin: 20px 0; }
        .feature { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${escapeHtml(planName)}!</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(userName)},</p>
          <p>Your subscription is now active. Here's what you've unlocked:</p>
          <div style="text-align: center;">
            <span class="plan-badge">${escapeHtml(planName)} Plan</span>
          </div>
          <div class="features">
            <div class="feature">Unlimited vehicles</div>
            <div class="feature">Advanced maintenance tracking</div>
            <div class="feature">Priority support</div>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            You can manage your subscription from your billing settings at any time.
          </p>
        </div>
        <div class="footer">
          Bitácora - Your vehicle management app
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, `Welcome to ${planName} - Bitácora`, html);
}

export async function sendSubscriptionCanceledEmail(
  to: string,
  userName: string,
  planName: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6b7280; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info { background: #eff6ff; padding: 12px; border-radius: 6px; margin: 15px 0; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Subscription Canceled</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(userName)},</p>
          <p>Your <strong>${escapeHtml(planName)}</strong> subscription has been canceled.</p>
          <div class="info">
            Your account will revert to the free tier at the end of your current billing period. You'll keep access to your current features until then.
          </div>
          <p>You can resubscribe anytime from your billing settings.</p>
        </div>
        <div class="footer">
          Bitácora - Your vehicle management app
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, "Subscription Canceled - Bitácora", html);
}

export async function sendSubscriptionSuspendedEmail(
  to: string,
  userName: string,
  planName: string
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
        .warning { background: #fef2f2; padding: 12px; border-radius: 6px; margin: 15px 0; font-size: 14px; border-left: 4px solid #dc2626; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Failed</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(userName)},</p>
          <p>We couldn't process the payment for your <strong>${escapeHtml(planName)}</strong> subscription.</p>
          <div class="warning">
            <strong>Action required:</strong> Please update your payment method to avoid losing access to premium features.
          </div>
          <p>Log in to your Bitácora account and visit Billing Settings to update your payment information.</p>
        </div>
        <div class="footer">
          Bitácora - Your vehicle management app
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, "Payment Failed - Action Required - Bitácora", html);
}

export async function sendSubscriptionReactivatedEmail(
  to: string,
  userName: string,
  planName: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .badge { display: inline-block; background: #d1fae5; color: #059669; padding: 6px 16px; border-radius: 9999px; font-weight: 600; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome Back!</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(userName)},</p>
          <p>Your <strong>${escapeHtml(planName)}</strong> subscription has been reactivated.</p>
          <div style="text-align: center;">
            <span class="badge">Active</span>
          </div>
          <p>You have full access to all your premium features again. Thank you for being a Bitácora subscriber!</p>
        </div>
        <div class="footer">
          Bitácora - Your vehicle management app
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, "Subscription Reactivated - Bitácora", html);
}

export async function sendVehicleCreatedEmail(
  to: string,
  vehicle: { make: string; model: string; year: number; nickname: string | null; vehicleType: string }
) {
  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vehicle-tracker-chi.vercel.app"}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .vehicle-name { font-size: 18px; font-weight: bold; color: #1f2937; margin: 15px 0; }
        .detail { background: white; padding: 12px; border-radius: 6px; margin: 10px 0; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Vehicle Added</h1>
        </div>
        <div class="content">
          <p>Your new vehicle has been added to your fleet:</p>
          <div class="vehicle-name">${escapeHtml(vehicleName)}${vehicle.nickname ? ` (${escapeHtml(vehicle.nickname)})` : ""}</div>
          <div class="detail">
            <strong>Type:</strong> ${escapeHtml(vehicle.vehicleType)}<br />
            <strong>Year:</strong> ${vehicle.year}
          </div>
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">View Dashboard</a>
          </div>
        </div>
        <div class="footer">
          Bitácora - Your vehicle management app
        </div>
      </div>
    </body>
    </html>
  `;

  return sendViaResend(to, `Vehicle Added: ${vehicleName}`, html);
}