'use strict';
const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res) => {
  const { name, email, phone, password, role, department } = req.body;
  const data = await authService.register({ name, email, phone, password, role, department });
  ApiResponse.created(res, {
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }, 'Registration successful');
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login({ email, password });
  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', data.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  ApiResponse.success(res, {
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }, 'Login successful');
});

const refreshToken = catchAsync(async (req, res) => {
  const token = req.body.refreshToken || req.cookies.refreshToken;
  const data = await authService.refreshTokens(token);
  res.cookie('refreshToken', data.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  ApiResponse.success(res, data, 'Token refreshed');
});

const logout = catchAsync(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
  await authService.logout(req.user._id, req.token, refreshToken);
  res.clearCookie('refreshToken');
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


// POST /api/v1/auth/create-staff  (admin only)
const createStaff = catchAsync(async (req, res) => {
  const { name, email, phone, password, departmentId } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already in use');

  const staff = await User.create({
    name, email, phone, password,
    role: 'staff',
    department: departmentId || null,
    isEmailVerified: true, // admin-created accounts skip verification
  });

  ApiResponse.created(res, staff, 'Staff account created');
});
module.exports = { register, login, refreshToken, logout, logoutAll, changePassword, forgotPassword, resetPassword, getMe };
