const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/department.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { departmentRules } = require('../../validators/queue.validator');
const auditLog = require('../../middlewares/audit.middleware');

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management
 */

/**
 * @swagger
 * /departments:
 *   get:
 *     tags: [Departments]
 *     summary: List all departments (public)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated department list
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     tags: [Departments]
 *     summary: Get a single department
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Department object
 */
router.get('/:id', ctrl.getOne);

/**
 * @swagger
 * /departments:
 *   post:
 *     tags: [Departments]
 *     summary: Create department (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name: { type: string }
 *               code: { type: string, example: REV }
 *               description: { type: string }
 *               activeCounters: { type: integer }
 *               avgServiceTimeMinutes: { type: integer }
 *     responses:
 *       201:
 *         description: Department created
 */
router.post('/', authenticate, authorize('admin', 'super_admin'), departmentRules, validate,
  auditLog('department.create', 'Department'), ctrl.create);

/**
 * @swagger
 * /departments/{id}:
 *   patch:
 *     tags: [Departments]
 *     summary: Update department
 *   delete:
 *     tags: [Departments]
 *     summary: Deactivate department
 */
router.patch('/:id', authenticate, authorize('admin', 'super_admin'), validate,
  auditLog('department.update', 'Department'), ctrl.update);

router.delete('/:id', authenticate, authorize('super_admin'),
  auditLog('department.delete', 'Department'), ctrl.remove);

module.exports = router;
