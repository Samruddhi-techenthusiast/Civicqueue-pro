'use strict';
const authService = require('../services/auth.service');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// Shared cookie options for the refresh-token cookie — kept in one place so
// login/refresh always set it identically and logout/logout-all can clear it
// with matching attributes (browsers ignore clearCookie if attributes don't match).
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = catchAsync(async (req, res) => {
  const { name, email, phone, password, role, department } = req.body;
  const data = await authService.register({ name, email, phone, password, role, department });
  res.cookie('refreshToken', data.refreshToken, REFRESH_COOKIE_OPTIONS);
  ApiResponse.created(res, {
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }, 'Registration successful');
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login({ email, password });
  // Refresh token goes out as an httpOnly cookie — JS on the frontend can't read it,
  // which is the whole point. It is also still returned in the body for non-browser
  // API clients (Postman, mobile apps) that can't rely on cookie jars.
  res.cookie('refreshToken', data.refreshToken, REFRESH_COOKIE_OPTIONS);
  ApiResponse.success(res, {
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }, 'Login successful');
});

const refreshToken = catchAsync(async (req, res) => {
  // Cookie is the primary source (what the browser frontend uses); body is a
  // fallback for non-browser clients. Optional chaining is required here because
  // req.cookies is only populated at all once cookie-parser is registered — and
  // even then, a request with no cookies sent yields an empty object, not this
  // token specifically, so the fallback still matters.
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw ApiError.badRequest('Refresh token is required (cookie or body)');
  const data = await authService.refreshTokens(token);
  res.cookie('refreshToken', data.refreshToken, REFRESH_COOKIE_OPTIONS);
  ApiResponse.success(res, data, 'Token refreshed');
});

const logout = catchAsync(async (req, res) => {
  const refreshTokenValue = req.cookies?.refreshToken || req.body.refreshToken;
  await authService.logout(req.user._id, req.token, refreshTokenValue);
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  ApiResponse.success(res, null, 'Logged out successfully');
});

const logoutAll = catchAsync(async (req, res) => {
  await authService.logoutAll(req.user._id, req.token);
  res.clearCookie('refreshToken');
  ApiResponse.success(res, null, 'All sessions terminated');
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  ApiResponse.success(res, null, 'Password changed successfully');
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.generatePasswordResetToken(req.body.email);
  // In production: send email with resetToken. Here we return it for dev.
  ApiResponse.success(res, process.env.NODE_ENV === 'development' ? result : null,
    'If that email exists, a reset link has been sent');
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  ApiResponse.success(res, null, 'Password reset successful');
});

const getMe = catchAsync(async (req, res) => {
  ApiResponse.success(res, req.user, 'Profile fetched');
});


const createStaff = catchAsync(async (req, res) => {
  const { name, email, phone, password, departmentId } = req.body;
  if (!name || !email || !password) {
    throw ApiError.badRequest('name, email and password are required');
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('A user with this email already exists');
  }
  const staff = await User.create({
    name,
    email: email.toLowerCase(),
    phone: phone || null,
    password,
    role: 'staff',
    department: departmentId || null,
    isEmailVerified: true, // admin-created accounts skip email verification
  });
  ApiResponse.created(res, staff, 'Staff account created successfully');
});

module.exports = { register, createStaff, login, refreshToken, logout, logoutAll, changePassword, forgotPassword, resetPassword, getMe };
