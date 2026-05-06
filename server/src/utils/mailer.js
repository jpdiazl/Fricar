import nodemailer from 'nodemailer';

let cached;

export function getTransporter() {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  cached = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user, pass }
  });

  return cached;
}

export async function sendMail({ to, subject, html, attachments }) {
  const transporter = getTransporter();
  if (!transporter) {
    // No SMTP configured - behave as a no-op but report in logs
    console.warn('[mailer] SMTP no configurado. Email no enviado:', { to, subject });
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    attachments: attachments || []
  });
}
