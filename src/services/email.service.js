// src/services/email.service.js
'use strict';
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const TEMPLATES = {
  token_issued: (data) => ({
    subject: `Your Queue Token: ${data.tokenNumber}`,
    html: `<p>Your token <strong>${data.tokenNumber}</strong> has been issued.
           Position: #${data.position}. Estimated wait: ${data.estimatedWaitMinutes} min.</p>`,
  }),
  token_called: (data) => ({
    subject: `It's Your Turn — ${data.tokenNumber}`,
    html: `<p>Token <strong>${data.tokenNumber}</strong> — please proceed to <strong>${data.counter}</strong>.</p>`,
  }),
  appointment_confirmed: (data) => ({
    subject: `Appointment Confirmed — ${data.date}`,
    html: `<p>Your appointment on <strong>${data.date}</strong> at <strong>${data.timeSlot?.start}</strong>
           is confirmed. Code: <strong>${data.confirmationCode}</strong></p>`,
  }),
};

const sendEmail = async (to, type, data = {}) => {
  if (!process.env.SMTP_USER) {
    logger.info(`[Email stub] Would send "${type}" to ${to}`, data);
    return;
  }
  try {
    const template = TEMPLATES[type]?.(data);
    if (!template) return;
    await transporter.sendMail({
      from: `CivicQueue <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });
  } catch (err) {
    logger.warn(`Email send failed (${type})`, { err: err.message });
  }
};

module.exports = { sendEmail };