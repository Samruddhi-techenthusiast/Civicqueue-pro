'use strict';
const queueService = require('../services/queue.service');
const tokenRepo = require('../repositories/token.repository');
const Queue = require('../models/Queue.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { getPagination, buildSort } = require('../utils/helpers');
const socketManager = require('../sockets/socket.manager');

// ── Queue management ──────────────────────────────────────────────────────────

const openQueue = catchAsync(async (req, res) => {
  const queue = await queueService.openQueue(req.params.departmentId, req.user._id);
  socketManager.emitQueueUpdate(req.params.departmentId, { type: 'queue:opened', queue });
  ApiResponse.success(res, queue, 'Queue opened');
});

const getQueueStatus = catchAsync(async (req, res) => {
  const status = await queueService.getQueueStatus(req.params.departmentId);
  ApiResponse.success(res, status);
});

const updateQueueStatus = catchAsync(async (req, res) => {
  const { status, pauseReason } = req.body;
  const queue = await queueService.updateQueueStatus(
    req.params.departmentId, status, req.user._id, pauseReason
  );
  socketManager.emitQueueUpdate(req.params.departmentId, { type: `queue:${status}`, queue });
  ApiResponse.success(res, queue, `Queue ${status}`);
});

// ── Token operations ──────────────────────────────────────────────────────────

const issueToken = catchAsync(async (req, res) => {
  const { departmentId, citizenName, citizenPhone, serviceType, priority, priorityReason } = req.body;
  const citizen = req.user.role === 'citizen' ? req.user : null;

  const result = await queueService.issueToken({
    departmentId,
    citizen,
    citizenName: citizenName || citizen?.name,
    citizenPhone: citizenPhone || citizen?.phone,
    serviceType,
    priority,
    priorityReason,
  });

  // Broadcast new token to the department room
  socketManager.emitQueueUpdate(departmentId, {
    type: 'token:issued',
    token: result.token,
    waitingCount: result.position,
  });

  ApiResponse.created(res, result, 'Token issued successfully');
});

const callNext = catchAsync(async (req, res) => {
  const { departmentId, counter } = req.body;
  const result = await queueService.callNext(departmentId, req.user._id, counter);

  socketManager.emitQueueUpdate(departmentId, {
    type: 'token:called',
    token: result.token,
    counter: result.counter,
  });
  // Alert the specific citizen
  if (result.token.citizen) {
    socketManager.emitToUser(result.token.citizen.toString(), 'token:your_turn', {
      tokenNumber: result.token.tokenNumber,
      counter: result.counter,
    });
  }

  ApiResponse.success(res, result, 'Next token called');
});

const markServed = catchAsync(async (req, res) => {
  const token = await queueService.markServed(req.params.id, req.user._id);
  socketManager.emitQueueUpdate(token.department.toString(), { type: 'token:served', token });
  ApiResponse.success(res, token, 'Token marked as served');
});

const cancelToken = catchAsync(async (req, res) => {
  const token = await queueService.cancelToken(req.params.id, req.user._id, req.body.cancelReason);
  socketManager.emitQueueUpdate(token.department.toString(), { type: 'token:cancelled', token });
  ApiResponse.success(res, token, 'Token cancelled');
});

const verifyToken = catchAsync(async (req, res) => {
  const result = await queueService.verifyToken(req.params.id);
  ApiResponse.success(res, result);
});

const getTokensByQueue = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  // Department-level isolation for staff: verify the queue belongs to their dept
  if (req.user.role === 'staff') {
    const queue = await Queue.findById(req.params.queueId).select('department').lean();
    if (!queue) throw ApiError.notFound('Queue not found');
    if (queue.department.toString() !== req.user.department?.toString()) {
      throw ApiError.forbidden('You can only view tokens from your assigned department');
    }
  }

  const filter = { queue: req.params.queueId };
  if (status) filter.status = status;

  const { data, pagination } = await tokenRepo.paginate(filter, {
    page, limit, skip,
    sort: buildSort(req.query.sort, { serial: 1 }),
    populate: [{ path: 'citizen', select: 'name phone email' }],
  });
  ApiResponse.paginated(res, data, pagination);
});

const getMyTokens = catchAsync(async (req, res) => {
  const opts = getPagination(req.query);
  const result = await tokenRepo.getCitizenHistory(req.user._id, opts);
  ApiResponse.paginated(res, result.data, result.pagination);
});

const getTokenQRCode = catchAsync(async (req, res) => {
  const token = await tokenRepo.findById(req.params.id, { select: 'qrCode tokenNumber status citizen' });
  if (!token) throw ApiError.notFound('Token not found');
  // Citizens can only see their own token
  if (req.user.role === 'citizen' && token.citizen?.toString() !== req.user._id.toString())
    throw ApiError.forbidden('Not your token');
  if (!token.qrCode) throw ApiError.notFound('QR code not generated yet');
  ApiResponse.success(res, { qrCode: token.qrCode, tokenNumber: token.tokenNumber });
});


const skipToken = catchAsync(async (req, res) => {
  const token = await queueService.skipToken(req.params.id, req.user._id, req.body.reason);
  socketManager.emitQueueUpdate(token.department.toString(), { type: 'token:skipped', token });
  ApiResponse.success(res, token, 'Token skipped');
});

const recallToken = catchAsync(async (req, res) => {
  const { counter } = req.body;
  const token = await queueService.recallToken(req.params.id, req.user._id, counter);
  socketManager.emitQueueUpdate(token.department.toString(), { type: 'token:recalled', token, counter });
  if (token.citizen) {
    socketManager.emitToUser(token.citizen.toString(), 'token:your_turn', {
      tokenNumber: token.tokenNumber,
      counter: counter || token.counter,
      isRecall: true,
    });
  }
  ApiResponse.success(res, token, 'Token recalled');
});

module.exports = {
  openQueue, getQueueStatus, updateQueueStatus,
  issueToken, callNext, markServed, cancelToken,
  skipToken, recallToken,
  verifyToken, getTokensByQueue, getMyTokens, getTokenQRCode,
};
