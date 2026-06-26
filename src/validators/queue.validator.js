const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const isObjectId = (val) => {
  if (!mongoose.Types.ObjectId.isValid(val)) throw new Error('Invalid ID');
  return true;
};

// ── Department ────────────────────────────────────────────────────────────────
const departmentRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 150 }),
  body('code')
    .trim().notEmpty().withMessage('Code is required')
    .matches(/^[A-Z0-9]+$/).withMessage('Code must be uppercase alphanumeric')
    .isLength({ max: 10 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('activeCounters').optional().isInt({ min: 1, max: 50 }),
  body('avgServiceTimeMinutes').optional().isInt({ min: 1 }),
  body('maxQueueSize').optional().isInt({ min: 1, max: 1000 }),
];

// ── Token ─────────────────────────────────────────────────────────────────────
const issueTokenRules = [
  body('departmentId').custom(isObjectId).withMessage('Valid department ID required'),
  body('citizenName').optional().trim().isLength({ min: 2, max: 100 }),
  body('citizenPhone').optional().matches(/^[6-9]\d{9}$/),
  body('serviceType').optional().trim().isLength({ max: 100 }),
  body('priority').optional().isIn(['normal', 'high', 'urgent']),
  body('priorityReason').optional().trim().isLength({ max: 200 }),
];

const callNextRules = [
  body('departmentId').custom(isObjectId),
  body('counter').optional().trim().isLength({ max: 50 }),
];

const updateTokenStatusRules = [
  param('id').custom(isObjectId).withMessage('Valid token ID required'),
  body('status').isIn(['serving', 'served', 'cancelled', 'no_show']).withMessage('Invalid status'),
  body('cancelReason').optional().trim().isLength({ max: 300 }),
  body('notes').optional().trim().isLength({ max: 500 }),
];

// ── Queue ─────────────────────────────────────────────────────────────────────
const queueStatusRules = [
  body('status').isIn(['open', 'paused', 'closed']).withMessage('Invalid queue status'),
  body('pauseReason').optional().trim().isLength({ max: 200 }),
];

// ── Appointment ───────────────────────────────────────────────────────────────
const appointmentRules = [
  body('departmentId').custom(isObjectId),
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD')
    .custom((val) => {
      if (new Date(val) < new Date().setHours(0, 0, 0, 0))
        throw new Error('Date must be today or future');
      return true;
    }),
  body('timeSlot.start').matches(/^\d{2}:\d{2}$/).withMessage('Time must be HH:MM'),
  body('timeSlot.end').matches(/^\d{2}:\d{2}$/).withMessage('Time must be HH:MM'),
  body('serviceType').optional().trim().isLength({ max: 100 }),
  body('notes').optional().trim().isLength({ max: 500 }),
];

// ── Common query pagination rules ─────────────────────────────────────────────
const paginationRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  departmentRules,
  issueTokenRules,
  callNextRules,
  updateTokenStatusRules,
  queueStatusRules,
  appointmentRules,
  paginationRules,
};
