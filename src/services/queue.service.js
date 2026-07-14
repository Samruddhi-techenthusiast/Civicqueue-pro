'use strict';
const queueRepo = require('../repositories/queue.repository');
const tokenRepo = require('../repositories/token.repository');
const deptRepo = require('../repositories/department.repository');
const notificationService = require('./notification.service');
const { generateTokenNumber, calculateEWT, generateQRCode, generateSecureToken } = require('../utils/helpers');
const { cache } = require('../config/redis');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const Queue = require('../models/Queue.model');
// ── Queue lifecycle ────────────────────────────────────────────────────────────

const openQueue = async (departmentId, staffId) => {
  const dept = await deptRepo.findById(departmentId);
  if (!dept) throw ApiError.notFound('Department not found');

  const queue = await queueRepo.findOrCreateToday(departmentId, staffId);
  if (queue.status === 'open') return queue;

  const updated = await queueRepo.findByIdAndUpdate(queue._id, {
    status: 'open',
    openedAt: queue.openedAt || new Date(),
    pauseReason: null,
    managedBy: staffId,
  });

  await invalidateQueueCache(departmentId);
  logger.info(`Queue opened for dept ${dept.code}`);
  return updated;
};

const updateQueueStatus = async (departmentId, status, staffId, pauseReason) => {
  const queue = await queueRepo.findTodayByDept(departmentId);
  if (!queue) throw ApiError.notFound('No active queue found for today');

  const updateData = { status, managedBy: staffId };
  if (status === 'paused') updateData.pauseReason = pauseReason || 'Paused by staff';
  if (status === 'closed') updateData.closedAt = new Date();

  const updated = await queueRepo.findByIdAndUpdate(queue._id, updateData);
  await invalidateQueueCache(departmentId);
  return updated;
};

const getQueueStatus = async (departmentId) => {
  const cacheKey = `queue:status:${departmentId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const queue = await queueRepo.findTodayByDept(departmentId);
  if (!queue) {
    const dept = await deptRepo.findById(departmentId);
    if (!dept) throw ApiError.notFound('Department not found');
    return { department: dept, queue: null, waitingCount: 0, message: 'Queue not opened today' };
  }

  const [waitingCount, servingCount, servedCount] = await Promise.all([
    tokenRepo.countByStatus(queue._id, 'waiting'),
    tokenRepo.countByStatus(queue._id, 'serving'),
    tokenRepo.countByStatus(queue._id, 'served'),
  ]);

  const dept = await deptRepo.findById(departmentId);
  const result = {
    queue,
    department: dept,
    waitingCount,
    servingCount,
    servedCount,
    avgServiceTimeMinutes: queue.avgServiceTimeMinutes,
    estimatedWaitForNew: calculateEWT(waitingCount + 1, queue.avgServiceTimeMinutes, queue.activeCounters),
  };

  await cache.set(cacheKey, result, 10); // 10 second cache
  return result;
};

// ── Token lifecycle ────────────────────────────────────────────────────────────

const issueToken = async ({ departmentId, citizen, citizenName, citizenPhone, serviceType, priority, priorityReason, appointmentRef }) => {
  const dept = await deptRepo.findById(departmentId);
  if (!dept) throw ApiError.notFound('Department not found');
  if (!dept.isActive) throw ApiError.badRequest('Department is not active');

  // Get or create today's queue
  let queue = await queueRepo.findTodayByDept(departmentId);
  if (!queue) throw ApiError.badRequest('Queue has not been opened today. Please contact staff.');
  if (queue.status === 'closed') throw ApiError.badRequest('Queue is closed for today');
  if (queue.status === 'paused') throw ApiError.badRequest(`Queue is paused: ${queue.pauseReason || 'Temporarily unavailable'}`);

  // Check max queue size
  const waitingCount = await tokenRepo.countByStatus(queue._id, 'waiting');
  if (waitingCount >= dept.maxQueueSize) throw ApiError.badRequest('Queue is full. Please try again later or book an appointment.');

  // Increment serial atomically
  const updatedQueue = await queueRepo.incrementSerial(queue._id);
  const serial = updatedQueue.currentSerial;
  const tokenNumber = generateTokenNumber(dept.code, serial);
  const today = new Date().toISOString().slice(0, 10);

  // Position (waiting tokens ahead + 1)
  const position = waitingCount + 1;
  const estimatedWaitMinutes = calculateEWT(position, queue.avgServiceTimeMinutes, queue.activeCounters);

  // Generate verification code
  const verificationCode = generateSecureToken(4).toUpperCase();

  const token = await tokenRepo.create({
    tokenNumber,
    citizen: citizen?._id || citizen || null,
    citizenName: citizenName || citizen?.name || 'Walk-in',
    citizenPhone: citizenPhone || citizen?.phone || null,
    department: departmentId,
    queue: queue._id,
    serviceType: serviceType || 'General',
    priority: priority || 'normal',
    priorityReason: priorityReason || null,
    serial,
    position,
    estimatedWaitMinutes,
    verificationCode,
    date: today,
    appointmentRef: appointmentRef || null,
    issuedAt: new Date(),
  });

  // Generate QR code (non-blocking)
  generateQRCode(token._id).then(async (qr) => {
    await tokenRepo.findByIdAndUpdate(token._id, { qrCode: qr });
  }).catch(err => logger.warn('QR gen failed', { err: err.message }));

  // Notify citizen
  if (citizen?._id || citizen) {
    await notificationService.createNotification({
      recipient: citizen?._id || citizen,
      type: 'token_issued',
      title: 'Token Issued',
      message: `Your token ${tokenNumber} has been issued. Estimated wait: ${estimatedWaitMinutes} minutes.`,
      data: { tokenId: token._id, tokenNumber, position, estimatedWaitMinutes },
      ref: token._id,
      refModel: 'Token',
    });
  }

  await invalidateQueueCache(departmentId);
  logger.info(`Token issued: ${tokenNumber} for dept ${dept.code}`);
  return { token, position, estimatedWaitMinutes };
};


const callNext = async (departmentId, staffId, counter) => {
  // FIX 9: Verify staff belongs to this department
  const User = require('../models/User.model')
  const staff = await User.findById(staffId).lean()
  if (staff.role === 'staff' && staff.department?.toString() !== departmentId.toString()) {
    throw ApiError.forbidden('You can only manage your own department queue')
  }

  const queue = await queueRepo.findTodayByDept(departmentId)
  if (!queue) throw ApiError.notFound('No active queue today')
  if (queue.status !== 'open') throw ApiError.badRequest(`Queue is ${queue.status}`)

  const Token = require('../models/Token.model')

  // FIX 2: Single atomic findOneAndUpdate — eliminates race condition
  const nextToken = await Token.findOneAndUpdate(
    {
      queue: queue._id,
      status: 'waiting',         // only grab waiting tokens
    },
    {
      $set: {
        status: 'serving',
        calledAt: new Date(),
        servingStartedAt: new Date(),
        servedBy: staffId,
        counter: counter || 'Counter 1',
        position: 0,
      },
    },
    {
      sort: { priorityOrder: -1, serial: 1 },  // FIX 1: integer priority sort
      new: true,
      // If two staff call simultaneously:
      // First  → finds 'waiting' token, updates to 'serving', returns it
      // Second → no 'waiting' token found (it's now 'serving'), returns null
    }
  ).lean()

  if (!nextToken) throw ApiError.notFound('No more waiting tokens')

  // Update queue nowServing display
  await Queue.findByIdAndUpdate(queue._id, {
    nowServing: nextToken._id,
    nowServingNumber: nextToken.tokenNumber,
  })

  // Notify citizen (async, non-blocking)
  if (nextToken.citizen) {
    notificationService.createNotification({
      recipient: nextToken.citizen,
      type: 'token_called',
      title: 'Your Turn!',
      message: `Token ${nextToken.tokenNumber} — please proceed to ${counter || 'the counter'}.`,
      ref: nextToken._id,
      refModel: 'Token',
    }).catch(() => {})
  }

  // Recalculate positions (async, non-blocking — doesn't block the response)
  updateWaitingPositions(queue._id, queue.avgServiceTimeMinutes, queue.activeCounters)
    .catch(() => {})

  await invalidateQueueCache(departmentId)
  return { token: nextToken, counter }
}

const markServed = async (tokenId, staffId) => {
  const token = await tokenRepo.findById(tokenId);
  if (!token) throw ApiError.notFound('Token not found');
  if (token.status !== 'serving') throw ApiError.badRequest('Token is not currently being served');

  const now = new Date();
  const serviceMinutes = token.servingStartedAt
    ? Math.round((now - new Date(token.servingStartedAt)) / 60000)
    : 0;

  const updated = await tokenRepo.findByIdAndUpdate(tokenId, {
    status: 'served',
    servedAt: now,
    servedBy: staffId,
  });

  await queueRepo.incrementServed(token.queue, serviceMinutes);
  await invalidateQueueCache(token.department.toString());

  if (token.citizen) {
    await notificationService.createNotification({
      recipient: token.citizen,
      type: 'token_served',
      title: 'Service Completed',
      message: `Token ${token.tokenNumber} has been served. Thank you!`,
      data: { tokenId, serviceMinutes },
      ref: tokenId,
      refModel: 'Token',
    });
  }

  return updated;
};

const cancelToken = async (tokenId, cancelledBy, cancelReason) => {
  const token = await tokenRepo.findById(tokenId);
  if (!token) throw ApiError.notFound('Token not found');
  if (['served', 'cancelled'].includes(token.status))
    throw ApiError.badRequest(`Cannot cancel a ${token.status} token`);

  const updated = await tokenRepo.findByIdAndUpdate(tokenId, {
    status: 'cancelled',
    cancelledAt: new Date(),
    cancelledBy,
    cancelReason: cancelReason || 'Cancelled',
  });

  await queueRepo.findByIdAndUpdate(token.queue, { $inc: { totalCancelled: 1 } });
  await invalidateQueueCache(token.department.toString());

  if (token.citizen) {
    await notificationService.createNotification({
      recipient: token.citizen,
      type: 'token_cancelled',
      title: 'Token Cancelled',
      message: `Token ${token.tokenNumber} has been cancelled.`,
      data: { tokenId, cancelReason },
      ref: tokenId,
      refModel: 'Token',
    });
  }

  return updated;
};

const verifyToken = async (tokenId) => {
  const token = await tokenRepo.findById(tokenId, {
    populate: [
      { path: 'department', select: 'name code location' },
      { path: 'queue', select: 'status nowServingNumber' },
    ],
    lean: true,
  });
  if (!token) throw ApiError.notFound('Token not found');

  return {
    token,
    isValid: ['waiting', 'serving'].includes(token.status),
    message: token.status === 'waiting'
      ? `Token is valid. Position: ${token.position}`
      : token.status === 'serving'
      ? 'Token is currently being served'
      : `Token status: ${token.status}`,
  };
};


const skipToken = async (tokenId, staffId, reason) => {
  const token = await tokenRepo.findById(tokenId);
  if (!token) throw ApiError.notFound('Token not found');
  if (!['waiting', 'serving'].includes(token.status))
    throw ApiError.badRequest('Can only skip a waiting or serving token');

  const updated = await tokenRepo.findByIdAndUpdate(tokenId, {
    status: 'no_show',
    cancelledAt: new Date(),
    cancelledBy: staffId,
    cancelReason: reason || 'No show / skipped',
  });

  // Clear nowServing if this was the active token
  const queue = await queueRepo.findById(token.queue);
  if (queue?.nowServing?.toString() === tokenId.toString()) {
    await queueRepo.findByIdAndUpdate(token.queue, {
      nowServing: null,
      nowServingNumber: null,
    });
  }

  await queueRepo.findByIdAndUpdate(token.queue, { $inc: { totalCancelled: 1 } });
  await invalidateQueueCache(token.department.toString());

  if (token.citizen) {
    await notificationService.createNotification({
      recipient: token.citizen,
      type: 'token_cancelled',
      title: 'Token Skipped',
      message: `Token ${token.tokenNumber} was marked as no-show. Please re-join the queue if needed.`,
      data: { tokenId },
      ref: tokenId,
      refModel: 'Token',
    });
  }
  return updated;
};

const recallToken = async (tokenId, staffId, counter) => {
  const token = await tokenRepo.findById(tokenId);
  if (!token) throw ApiError.notFound('Token not found');
  if (!['serving', 'no_show'].includes(token.status))
    throw ApiError.badRequest('Can only recall a token that is being served or was skipped');

  const updated = await tokenRepo.findByIdAndUpdate(tokenId, {
    status: 'serving',
    calledAt: new Date(),
    servedBy: staffId,
    counter: counter || token.counter || 'Counter 1',
  });

  if (token.citizen) {
    await notificationService.createNotification({
      recipient: token.citizen,
      type: 'token_called',
      title: 'Recall — Please Come Now!',
      message: `Token ${token.tokenNumber} is being recalled. Proceed to ${counter || token.counter || 'the counter'}.`,
      data: { tokenId, tokenNumber: token.tokenNumber, counter },
      ref: tokenId,
      refModel: 'Token',
    });
  }
  return updated;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const updateWaitingPositions = async (queueId, avgServiceTime, activeCounters) => {
  const waiting = await tokenRepo.getWaitingTokens(queueId);
  const bulkOps = waiting.map((t, idx) => ({
    updateOne: {
      filter: { _id: t._id },
      update: {
        $set: {
          position: idx + 1,
          estimatedWaitMinutes: calculateEWT(idx + 1, avgServiceTime, activeCounters),
        },
      },
    },
  }));
  if (bulkOps.length) {
    const Token = require('../models/Token.model');
    await Token.bulkWrite(bulkOps, { ordered: false });
  }
};

const invalidateQueueCache = async (departmentId) => {
  await cache.del(`queue:status:${departmentId}`);
};

module.exports = {
  openQueue,
  updateQueueStatus,
  getQueueStatus,
  issueToken,
  callNext,
  markServed,
  cancelToken,
  skipToken,
  recallToken,
  verifyToken,
  updateWaitingPositions,
};
