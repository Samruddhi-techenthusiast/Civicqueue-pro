'use strict';
const jwt = require('jsonwebtoken');
const socketManager = require('./socket.manager');
const queueService = require('../services/queue.service');
const tokenRepo = require('../repositories/token.repository');
const logger = require('../utils/logger');

const initSockets = (io) => {
  socketManager.init(io);

  // ── JWT authentication middleware ──────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
      }
      next();
    } catch {
      // Allow unauthenticated connections (citizens tracking public queue)
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} user:${socket.userId || 'anonymous'}`);

    // Join personal room for targeted notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // ── Event: join a department's public queue room ───────────────────────
    // Any visitor (no auth required) can watch queue status
    socket.on('join:queue', async ({ departmentId }) => {
      if (!departmentId) return;
      socket.join(`dept:${departmentId}`);
      logger.info(`Socket ${socket.id} joined dept:${departmentId}`);

      // Send current queue state immediately on join
      try {
        const status = await queueService.getQueueStatus(departmentId);
        socket.emit('queue:initial', status);
      } catch (err) {
        socket.emit('error', { message: 'Could not fetch queue status' });
      }
    });

    socket.on('leave:queue', ({ departmentId }) => {
      socket.leave(`dept:${departmentId}`);
    });

    // ── Event: staff joins dashboard room ─────────────────────────────────
    socket.on('join:dashboard', ({ departmentId }) => {
      if (!socket.userId || !['staff', 'admin', 'super_admin'].includes(socket.userRole)) {
        return socket.emit('error', { message: 'Authentication required' });
      }
      socket.join(`dashboard:${departmentId}`);
      logger.info(`Staff ${socket.userId} joined dashboard:${departmentId}`);
    });

    // ── Event: citizen tracks their own token ────────────────────────────
    socket.on('track:token', async ({ tokenId }) => {
      if (!tokenId) return;
      socket.join(`token:${tokenId}`);
      try {
        const token = await tokenRepo.findById(tokenId, {
          populate: [{ path: 'queue', select: 'status nowServingNumber' }],
        });
        if (token) socket.emit('token:status', token);
      } catch { /* ignore */ }
    });

    // ── Event: ping/pong for connection keep-alive ────────────────────────
    socket.on('ping', () => socket.emit('pong', { ts: Date.now() }));

    // ── Event: request fresh queue status ────────────────────────────────
    socket.on('queue:refresh', async ({ departmentId }) => {
      try {
        const status = await queueService.getQueueStatus(departmentId);
        socket.emit('queue:initial', status);
      } catch { /* ignore */ }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — ${reason}`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error ${socket.id}: ${err.message}`);
    });
  });

  logger.info('Socket.io initialized');
};

module.exports = initSockets;
