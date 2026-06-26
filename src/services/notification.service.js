'use strict';
const notificationRepo = require('../repositories/notification.repository');
const logger = require('../utils/logger');
const { sendEmail } = require('./email.service');
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
    const io = require('../sockets/socket.manager').getIO();
    if (io) {
      io.to(`user:${recipient.toString()}`).emit('notification:new', notification);
    }

if (['token_issued', 'token_called', 'appointment_confirmed'].includes(type)) {
  const User = require('../models/User.model');
  const user = await User.findById(recipient).select('email').lean();
  if (user?.email) sendEmail(user.email, type, data).catch(() => {});
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
