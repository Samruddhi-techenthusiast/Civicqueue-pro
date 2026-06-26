'use strict';

const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

// ── 1. Admin Overview ─────────────────────────────
const getOverview = catchAsync(async (req, res) => {
  const data = await analyticsService.getAdminOverview();
  ApiResponse.success(res, data, 'Admin overview');
});

// ── 2. Department Stats ───────────────────────────
const getDepartmentStats = catchAsync(async (req, res) => {
  const { departmentId } = req.params;

  const today = new Date().toISOString().slice(0, 10);

  const toDate = req.query.to || today;

  const fromDate = req.query.from || (() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  })();

  if (fromDate > toDate) {
    throw ApiError.badRequest('"from" date must be before "to" date');
  }

  if (
    req.user.role === 'staff' &&
    req.user.department?.toString() !== departmentId
  ) {
    throw ApiError.forbidden('Access restricted to your department');
  }

  const data = await analyticsService.getDepartmentAnalytics(
    new mongoose.Types.ObjectId(departmentId),
    fromDate,
    toDate
  );

  ApiResponse.success(res, data);
});

// ── 3. Weekly Overview ────────────────────────────
const getWeeklyOverview = catchAsync(async (req, res) => {
  const data = await analyticsService.getWeeklyOverview();
  ApiResponse.success(res, data, 'Weekly overview');
});


// ── 4. Staff Performance ──────────────────────────
const getStaffPerformance = catchAsync(async (req, res) => {
  const { departmentId } = req.params;
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  if (req.user.role === 'staff' &&
      req.user.department?.toString() !== departmentId) {
    throw ApiError.forbidden('Access restricted to your department');
  }

  const data = await analyticsService.getStaffPerformance(departmentId, date);
  ApiResponse.success(res, { date, staff: data }, 'Staff performance');
});

// ── EXPORTS ───────────────────────────────────────
module.exports = {
  getOverview,
  getDepartmentStats,
  getWeeklyOverview,
  getStaffPerformance,
};