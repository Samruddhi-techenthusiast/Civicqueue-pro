'use strict';
const BaseRepository = require('./base.repository');
const Notification = require('../models/Notification.model');

class NotificationRepository extends BaseRepository {
  constructor() { super(Notification); }

  async getUserNotifications(userId, paginationOpts = {}) {
    return this.paginate(
      { recipient: userId },
      { ...paginationOpts, sort: { createdAt: -1 } }
    );
  }

  async countUnread(userId) {
    return this.count({ recipient: userId, isRead: false });
  }

  async markAllRead(userId) {
    return this.model.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
  }

  async markOneRead(notificationId, userId) {
    return this.model.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true, lean: true }
    );
  }

  async createBulk(notifications) {
    return this.model.insertMany(notifications, { ordered: false });
  }
}

module.exports = new NotificationRepository();
