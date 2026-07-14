'use strict';
const notificationRepo = require('../repositories/notification.repository');
const { sendEmail } = require('./email.service');
const socketManager = require('../sockets/socket.manager');
const User = require('../models/User.model');
const logger = require('../utils/logger');

const createNotification = async ({ recipient, type, title, message, data = {}, channel = 'in_app', ref, refModel }) => {
  try {
    const notification = await notificationRepo.create({
      recipient,
      type,
      title,
      message,
      data,
      channel,
      ref: ref || null,
      refModel: refModel || null,
      isSent: true,
      sentAt: new Date(),
    });

    // Emit to socket room for real-time in-app delivery
    const io = socketManager.getIO();
    if (io) {
      io.to(`user:${recipient.toString()}`).emit('notification:new', notification);
    }

    // Fire-and-forget email for key notification types
    const EMAIL_TYPES = ['token_issued', 'token_called', 'token_served', 'appointment_confirmed', 'appointment_cancelled'];
    if (EMAIL_TYPES.includes(type)) {
      try {
        const user = await User.findById(recipient).select('email').lean();
        if (user?.email) sendEmail(user.email, type, data).catch(() => {});
      } catch { /* never block notification creation on email lookup failure */ }
    }

    return notification;
  } catch (err) {
    logger.error('Failed to create notification', { err: err.message });
  }
};

const getUserNotifications = async (userId, paginationOpts) => {
  const [result, unreadCount] = await Promise.all([
    notificationRepo.getUserNotifications(userId, paginationOpts),
    notificationRepo.countUnread(userId),
  ]);
  return { ...result, unreadCount };
};

const markRead = async (notificationId, userId) => {
  return notificationRepo.markOneRead(notificationId, userId);
};

const markAllRead = async (userId) => {
  return notificationRepo.markAllRead(userId);
};

module.exports = { createNotification, getUserNotifications, markRead, markAllRead };
