const mongoose = require('mongoose');
'use strict';
const Token = require('../models/Token.model');
const Queue = require('../models/Queue.model');
const Appointment = require('../models/Appointment.model');
const User = require('../models/User.model');
const { cache } = require('../config/redis');

const getDepartmentAnalytics = async (departmentId, fromDate, toDate) => {
  const cacheKey = `analytics:dept:${departmentId}:${fromDate}:${toDate}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const [tokenStats, appointmentStats, queueStats, hourlyDistribution] = await Promise.all([
    // Token status breakdown
    Token.aggregate([
      { $match: { department: departmentId, date: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: '$status', count: { $sum: 1 }, avgWaitMs: { $avg: { $subtract: ['$servedAt', '$issuedAt'] } } } },
    ]),

    // Appointment breakdown
    Appointment.aggregate([
      { $match: { department: departmentId, date: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Daily queue summary
    Queue.aggregate([
      { $match: { department: departmentId, date: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: '$date',
          totalServed: { $sum: '$totalServed' },
          totalCancelled: { $sum: '$totalCancelled' },
          avgServiceTime: { $avg: '$avgServiceTimeMinutes' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Hourly token distribution (busiest hours)
    Token.aggregate([
      { $match: { department: departmentId, date: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: { $hour: '$issuedAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]),
  ]);

  // Compute averages
  const servedGroup = tokenStats.find(s => s._id === 'served');
  const avgWaitMinutes = servedGroup?.avgWaitMs ? Math.round(servedGroup.avgWaitMs / 60000) : 0;
  const totalTokens = tokenStats.reduce((sum, s) => sum + s.count, 0);
  const totalServed = servedGroup?.count || 0;
  const serviceRate = totalTokens > 0 ? Math.round((totalServed / totalTokens) * 100) : 0;

  const result = {
    period: { from: fromDate, to: toDate },
    summary: {
      totalTokens,
      totalServed,
      serviceRate: `${serviceRate}%`,
      avgWaitMinutes,
      tokenBreakdown: tokenStats,
      appointmentBreakdown: appointmentStats,
    },
    dailyTrend: queueStats,
    hourlyDistribution,
  };

  await cache.set(cacheKey, result, 300); // 5 min cache
  return result;
};

const getAdminOverview = async () => {
  const cacheKey = 'analytics:admin:overview';
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const today = new Date().toISOString().slice(0, 10);

  const [totalUsers, activeQueues, todayTokens, todayServed] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Queue.countDocuments({ date: today, status: 'open' }),
    Token.countDocuments({ date: today }),
    Token.countDocuments({ date: today, status: 'served' }),
  ]);

  const result = { totalUsers, activeQueues, todayTokens, todayServed, generatedAt: new Date() };
  await cache.set(cacheKey, result, 30);
  return result;
};
// src/services/analytics.service.js — ADD getWeeklyOverview

const getWeeklyOverview = async () => {
  // Last 7 days — real data from MongoDB
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const fromDate = sevenDaysAgo.toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)

  const [weeklyTokens, statusBreakdown] = await Promise.all([
    // Real daily token data for the past 7 days
    Token.aggregate([
      { $match: { date: { $gte: fromDate, $lte: today } } },
      {
        $group: {
          _id: '$date',
          issued:    { $sum: 1 },
          served:    { $sum: { $cond: [{ $eq: ['$status', 'served'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          waiting:   { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          // Short day label: "2025-04-20" → "Apr 20"
          day: {
            $dateToString: {
              format: '%b %d',
              date: { $dateFromString: { dateString: '$_id' } }
            }
          },
          issued: 1, served: 1, cancelled: 1, waiting: 1
        }
      }
    ]),

    // Today's real status breakdown
    Token.aggregate([
      { $match: { date: today } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
  ])

  return { weeklyTokens, statusBreakdown }
}


const getStaffPerformance = async (departmentId, date) => {
  const cacheKey = `analytics:staff:${departmentId}:${date}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const deptObjId = new mongoose.Types.ObjectId(departmentId);

  const result = await Token.aggregate([
    {
      $match: {
        department: deptObjId,
        date,
        status: 'served',
        servedBy: { $ne: null },
      },
    },
    {
      $group: {
        _id: '$servedBy',
        tokensServed: { $sum: 1 },
        avgHandlingMs: {
          $avg: { $subtract: ['$servedAt', '$servingStartedAt'] },
        },
        totalHandlingMs: {
          $sum: { $subtract: ['$servedAt', '$servingStartedAt'] },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'staff',
      },
    },
    { $unwind: { path: '$staff', preserveNullAndEmpty: true } },
    {
      $project: {
        _id: 0,
        staffId: '$_id',
        name: '$staff.name',
        email: '$staff.email',
        tokensServed: 1,
        avgHandlingMinutes: {
          $round: [{ $divide: ['$avgHandlingMs', 60000] }, 1],
        },
      },
    },
    { $sort: { tokensServed: -1 } },
  ]);

  await cache.set(cacheKey, result, 120);
  return result;
};

module.exports = { getDepartmentAnalytics, getAdminOverview, getWeeklyOverview, getStaffPerformance }
