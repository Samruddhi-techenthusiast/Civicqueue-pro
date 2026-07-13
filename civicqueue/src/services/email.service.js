'use strict';
const logger = require('../utils/logger');

// Lazily initialise nodemailer only when SMTP env vars are set.
// If they're absent the service stubs every send to a console log,
// so the app boots and runs perfectly in dev with no email config.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return transporter;
  } catch {
    return null;
  }
};

// ── Email templates ──────────────────────────────────────────────────────────

const TEMPLATES = {
  token_issued: ({ tokenNumber, position, estimatedWaitMinutes }) => ({
    subject: `🎫 Your Queue Token: ${tokenNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#3366ff;margin-top:0">Token Issued ✅</h2>
        <p>Your token has been issued successfully.</p>
        <div style="background:#f8fafc;padding:16px;border-radius:8px;text-align:center;margin:16px 0">
          <p style="font-size:32px;font-weight:bold;font-family:monospace;color:#1e293b;margin:0">${tokenNumber}</p>
        </div>
        <table style="width:100%;font-size:14px">
          <tr><td style="color:#64748b">Position</td><td style="font-weight:bold">#${position}</td></tr>
          <tr><td style="color:#64748b">Estimated Wait</td><td style="font-weight:bold">~${estimatedWaitMinutes} min</td></tr>
        </table>
        <p style="color:#94a3b8;font-size:12px;margin-top:16px">You will be notified when your turn approaches.</p>
      </div>`,
  }),

  token_called: ({ tokenNumber, counter }) => ({
    subject: `📢 It's Your Turn — ${tokenNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:2px solid #10b981;border-radius:12px">
        <h2 style="color:#10b981;margin-top:0">Your Turn! 🟢</h2>
        <p>Token <strong style="font-family:monospace">${tokenNumber}</strong> is now being called.</p>
        <p>Please proceed to <strong>${counter || 'the counter'}</strong> immediately.</p>
      </div>`,
  }),

  token_served: ({ tokenNumber, serviceMinutes }) => ({
    subject: `✅ Service Complete — ${tokenNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#3366ff;margin-top:0">Service Completed</h2>
        <p>Token <strong>${tokenNumber}</strong> has been served. Thank you for visiting!</p>
        ${serviceMinutes ? `<p style="color:#64748b">Service duration: ~${serviceMinutes} min</p>` : ''}
      </div>`,
  }),

  appointment_confirmed: ({ date, timeSlot, confirmationCode, departmentName }) => ({
    subject: `📅 Appointment Confirmed — ${date}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#3366ff;margin-top:0">Appointment Confirmed ✅</h2>
        <table style="width:100%;font-size:14px;border-spacing:0 8px">
          <tr><td style="color:#64748b">Department</td><td style="font-weight:bold">${departmentName || '—'}</td></tr>
          <tr><td style="color:#64748b">Date</td><td style="font-weight:bold">${date}</td></tr>
          <tr><td style="color:#64748b">Time</td><td style="font-weight:bold">${timeSlot?.start || '—'}</td></tr>
          <tr><td style="color:#64748b">Confirmation Code</td>
              <td style="font-weight:bold;font-family:monospace;color:#3366ff">${confirmationCode || '—'}</td></tr>
        </table>
        <p style="color:#94a3b8;font-size:12px;margin-top:16px">Please bring a valid ID and your confirmation code.</p>
      </div>`,
  }),

  appointment_cancelled: ({ date, timeSlot }) => ({
    subject: `❌ Appointment Cancelled`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #fca5a5;border-radius:12px">
        <h2 style="color:#ef4444;margin-top:0">Appointment Cancelled</h2>
        <p>Your appointment on <strong>${date}</strong> at <strong>${timeSlot?.start || '—'}</strong> has been cancelled.</p>
        <p>You may book a new appointment at any time.</p>
      </div>`,
  }),
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Send a templated email.
 * @param {string} to       Recipient email address
 * @param {string} type     Notification type key (matches TEMPLATES)
 * @param {object} data     Template data
 */
const sendEmail = async (to, type, data = {}) => {
  const template = TEMPLATES[type]?.(data);
  if (!template) {
    logger.debug(`[Email] No template for type "${type}" — skipped`);
    return;
  }

  const t = getTransporter();
  if (!t) {
    logger.info(`[Email stub] "${type}" → ${to}`, {
      subject: template.subject,
      data,
    });
    return; // graceful stub — no crash
  }

  try {
    await t.sendMail({
      from: `CivicQueue <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });
    logger.debug(`[Email] Sent "${type}" to ${to}`);
  } catch (err) {
    // Non-fatal — log and move on; never throw
    logger.warn(`[Email] Failed to send "${type}" to ${to}`, {
      err: err.message,
    });
  }
};

module.exports = { sendEmail };
