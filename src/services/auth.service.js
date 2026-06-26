'use strict';
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepo = require('../repositories/user.repository');
const { cache } = require('../config/redis');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const signAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

const register = async ({ name, email, phone, password, role = 'citizen', department }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw ApiError.conflict('Email already registered');

  const user = await userRepo.create({ name, email, phone, password, role, department });
  logger.info(`New user registered: ${email} [${role}]`);

  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);
  await userRepo.addRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email, true);
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  // Check account lock
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw ApiError.forbidden(`Account locked. Try again in ${minutesLeft} minutes`);
  }

  // Instantiate model to use method
  const UserModel = require('../models/User.model');
  const userDoc = await UserModel.findById(user._id).select('+password +loginAttempts +lockUntil +refreshTokens');

  const isMatch = await userDoc.comparePassword(password);
  if (!isMatch) {
    await userDoc.incLoginAttempts();
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!userDoc.isActive) throw ApiError.forbidden('Account is deactivated');

  await userRepo.updateLastLogin(userDoc._id);

  const accessToken = signAccessToken(userDoc._id, userDoc.role);
  const refreshToken = signRefreshToken(userDoc._id);
  await userRepo.addRefreshToken(userDoc._id, refreshToken);

  // Invalidate cached user so fresh data loads
  await cache.del(`user:${userDoc._id}`);

  logger.info(`User logged in: ${email}`);
  return { user: userDoc, accessToken, refreshToken };
};

const refreshTokens = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const UserModel = require('../models/User.model');
  const user = await UserModel.findById(decoded.id).select('+refreshTokens');
  if (!user) throw ApiError.unauthorized('User not found');

  if (!user.refreshTokens.includes(token)) {
    // Token reuse detected — revoke all tokens (security measure)
    await userRepo.clearRefreshTokens(user._id);
    throw ApiError.unauthorized('Refresh token reuse detected — all sessions revoked');
  }

  await userRepo.removeRefreshToken(user._id, token);

  const newAccessToken = signAccessToken(user._id, user.role);
  const newRefreshToken = signRefreshToken(user._id);
  await userRepo.addRefreshToken(user._id, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logout = async (userId, accessToken, refreshToken) => {
  // Blacklist access token for its remaining TTL
  try {
    const decoded = jwt.decode(accessToken);
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) await cache.set(`bl:${accessToken}`, '1', ttl);
    }
  } catch { /* ignore */ }

  if (refreshToken) await userRepo.removeRefreshToken(userId, refreshToken);
  await cache.del(`user:${userId}`);
};

const logoutAll = async (userId, accessToken) => {
  await userRepo.clearRefreshTokens(userId);
  await cache.del(`user:${userId}`);
  try {
    const decoded = jwt.decode(accessToken);
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) await cache.set(`bl:${accessToken}`, '1', ttl);
    }
  } catch { /* ignore */ }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const UserModel = require('../models/User.model');
  const user = await UserModel.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  await user.save();

  // Revoke all refresh tokens on password change
  await userRepo.clearRefreshTokens(userId);
  await cache.del(`user:${userId}`);
};

const generatePasswordResetToken = async (email) => {
  const user = await userRepo.findByEmail(email);
  if (!user) return; // silent fail (don't reveal if email exists)

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await userRepo.findByIdAndUpdate(user._id, {
    passwordResetToken: hashedToken,
    passwordResetExpires: Date.now() + 10 * 60 * 1000, // 10 min
  });

  return { resetToken, user };
};

const resetPassword = async (resetToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const UserModel = require('../models/User.model');
  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  await userRepo.clearRefreshTokens(user._id);
  await cache.del(`user:${user._id}`);
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  logoutAll,
  changePassword,
  generatePasswordResetToken,
  resetPassword,
};
