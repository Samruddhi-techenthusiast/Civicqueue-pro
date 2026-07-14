const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/queue.controller');
const { authenticate, authorize, sameDepartment } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { issueTokenRules, callNextRules, updateTokenStatusRules, queueStatusRules } = require('../../validators/queue.validator');

const auditLog = require('../../middlewares/audit.middleware');

/**
 * @swagger
 * tags:
 *   - name: Queue
 *     description: Queue lifecycle management
 *   - name: Tokens
 *     description: Token operations
 */

// ── Queue management ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /queue/{departmentId}/open:
 *   post:
 *     tags: [Queue]
 *     summary: Open today's queue for a department
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Queue opened
 */
router.post('/:departmentId/open',
  authenticate, authorize('staff', 'admin', 'super_admin'), sameDepartment,
  auditLog('queue.open', 'Queue'), ctrl.openQueue);

/**
 * @swagger
 * /queue/{departmentId}/status:
 *   get:
 *     tags: [Queue]
 *     summary: Get live queue status (public)
 *     security: []
 */
router.get('/:departmentId/status', ctrl.getQueueStatus);

/**
 * @swagger
 * /queue/{departmentId}/status:
 *   patch:
 *     tags: [Queue]
 *     summary: Pause or close queue
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [open, paused, closed] }
 *               pauseReason: { type: string }
 */
router.patch('/:departmentId/status',
  authenticate, authorize('staff', 'admin', 'super_admin'), sameDepartment,
  queueStatusRules, validate, auditLog('queue.status_change', 'Queue'), ctrl.updateQueueStatus);

/**
 * @swagger
 * /queue/{queueId}/tokens:
 *   get:
 *     tags: [Tokens]
 *     summary: List tokens for a queue
 */
router.get('/:queueId/tokens',
  authenticate, authorize('staff', 'admin', 'super_admin'), ctrl.getTokensByQueue);

// ── Token lifecycle ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /queue/tokens/issue:
 *   post:
 *     tags: [Tokens]
 *     summary: Issue a new queue token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [departmentId]
 *             properties:
 *               departmentId: { type: string }
 *               citizenName: { type: string }
 *               citizenPhone: { type: string }
 *               serviceType: { type: string }
 *               priority: { type: string, enum: [normal, high, urgent] }
 *     responses:
 *       201:
 *         description: Token issued with position and EWT
 */
router.post('/tokens/issue',
  authenticate, issueTokenRules, validate,
  auditLog('token.issue', 'Token'), ctrl.issueToken);

/**
 * @swagger
 * /queue/tokens/call-next:
 *   post:
 *     tags: [Tokens]
 *     summary: Call the next waiting token
 */
router.post('/tokens/call-next',
  authenticate, authorize('staff', 'admin', 'super_admin'),
  callNextRules, validate, auditLog('token.call', 'Token'), ctrl.callNext);

/**
 * @swagger
 * /queue/tokens/my:
 *   get:
 *     tags: [Tokens]
 *     summary: Get current user's token history
 */
router.get('/tokens/my', authenticate, ctrl.getMyTokens);

/**
 * @swagger
 * /queue/tokens/verify/{id}:
 *   get:
 *     tags: [Tokens]
 *     summary: Verify a token by ID (QR scan)
 *     security: []
 */
router.get('/tokens/verify/:id', ctrl.verifyToken);

/**
 * @swagger
 * /queue/tokens/{id}/qr:
 *   get:
 *     tags: [Tokens]
 *     summary: Get token QR code
 */
router.get('/tokens/:id/qr', authenticate, ctrl.getTokenQRCode);

/**
 * @swagger
 * /queue/tokens/{id}/serve:
 *   patch:
 *     tags: [Tokens]
 *     summary: Mark token as served
 */
router.patch('/tokens/:id/serve',
  authenticate, authorize('staff', 'admin', 'super_admin'),
  auditLog('token.serve', 'Token'), ctrl.markServed);

/**
 * @swagger
 * /queue/tokens/{id}/cancel:
 *   patch:
 *     tags: [Tokens]
 *     summary: Cancel a token
 */
router.patch('/tokens/:id/cancel',
  authenticate, updateTokenStatusRules, validate,
  auditLog('token.cancel', 'Token'), ctrl.cancelToken);


/**
 * @swagger
 * /queue/tokens/{id}/skip:
 *   patch:
 *     tags: [Tokens]
 *     summary: Skip/No-show a token (waiting or serving)
 */
router.patch('/tokens/:id/skip',
  authenticate, authorize('staff', 'admin', 'super_admin'),
  auditLog('token.skip', 'Token'), ctrl.skipToken);

/**
 * @swagger
 * /queue/tokens/{id}/recall:
 *   patch:
 *     tags: [Tokens]
 *     summary: Recall a previously called or skipped token
 */
router.patch('/tokens/:id/recall',
  authenticate, authorize('staff', 'admin', 'super_admin'),
  auditLog('token.recall', 'Token'), ctrl.recallToken);

module.exports = router;
