'use strict';
let _io = null;

const init = (io) => { _io = io; };
const getIO = () => _io;

/**
 * Emit a queue update to all clients watching a department's room
 */
const emitQueueUpdate = (departmentId, payload) => {
  if (!_io) return;
  _io.to(`dept:${departmentId}`).emit('queue:update', { ...payload, ts: Date.now() });
};

/**
 * Emit an event directly to a specific user's personal room
 */
const emitToUser = (userId, event, payload) => {
  if (!_io) return;
  _io.to(`user:${userId}`).emit(event, { ...payload, ts: Date.now() });
};

/**
 * Broadcast dashboard update to admin/staff room
 */
const emitDashboardUpdate = (departmentId, payload) => {
  if (!_io) return;
  _io.to(`dashboard:${departmentId}`).emit('dashboard:update', { ...payload, ts: Date.now() });
};

module.exports = { init, getIO, emitQueueUpdate, emitToUser, emitDashboardUpdate };
