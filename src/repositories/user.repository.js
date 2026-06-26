'use strict';
const BaseRepository = require('./base.repository');
const User = require('../models/User.model');

class UserRepository extends BaseRepository {
  constructor() { super(User); }

  async findByEmail(email, withPassword = false) {
    const q = this.model.findOne({ email: email.toLowerCase() });
    if (withPassword) q.select('+password +refreshTokens +loginAttempts +lockUntil');
    return q.lean();
  }

  async findByPhone(phone) {
    return this.model.findOne({ phone }).lean();
  }

  async findActiveStaffByDept(departmentId) {
    return this.find({ department: departmentId, role: { $in: ['staff', 'admin'] }, isActive: true });
  }

  async searchUsers(searchTerm, filters = {}, paginationOpts = {}) {
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const filter = {
      ...filters,
      $or: [{ name: regex }, { email: regex }, { phone: regex }],
    };
    return this.paginate(filter, paginationOpts);
  }

  async addRefreshToken(userId, token) {
    return this.model.findByIdAndUpdate(
      userId,
      { $addToSet: { refreshTokens: token } },
      { new: true }
    );
  }

  async removeRefreshToken(userId, token) {
    return this.model.findByIdAndUpdate(
      userId,
      { $pull: { refreshTokens: token } },
      { new: true }
    );
  }

  async clearRefreshTokens(userId) {
    return this.model.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
  }

  async updateLastLogin(userId) {
    return this.model.findByIdAndUpdate(userId, { lastLogin: new Date(), loginAttempts: 0, $unset: { lockUntil: 1 } });
  }
}

module.exports = new UserRepository();
