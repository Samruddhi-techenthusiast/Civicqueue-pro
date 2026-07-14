const upload = require('../../middlewares/upload.middleware');
const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/appointment.controller');
const { authenticate, authorize, sameDepartment } = require('../../middlewares/auth.middleware');
const auditLog = require('../../middlewares/audit.middleware');
const validate = require('../../middlewares/validate.middleware');
const { appointmentRules } = require('../../validators/queue.validator');

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment booking and management
 */

/**
 * @swagger
 * /appointments/slots:
 *   get:
 *     tags: [Appointments]
 *     summary: Get available time slots
 *     security: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, example: '2025-04-20' }
 *     responses:
 *       200:
 *         description: List of available slots with availability flag
 */
router.get('/slots', ctrl.getSlots);

/**
 * @swagger
 * /appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Book an appointment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [departmentId, date, timeSlot]
 *             properties:
 *               departmentId: { type: string }
 *               date: { type: string, example: '2025-04-20' }
 *               timeSlot:
 *                 type: object
 *                 properties:
 *                   start: { type: string, example: '10:00' }
 *                   end: { type: string, example: '10:15' }
 *               serviceType: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Appointment booked with confirmation code
 */
router.post('/', authenticate, authorize('citizen', 'staff', 'admin', 'super_admin'),
  appointmentRules, validate, ctrl.book);

/**
 * @swagger
 * /appointments/my:
 *   get:
 *     tags: [Appointments]
 *     summary: Get my appointments
 */
router.get('/my', authenticate, ctrl.getMyAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointment details
 */
router.get('/:id', authenticate, ctrl.getOne);

/**
 * @swagger
 * /appointments/{id}/checkin:
 *   post:
 *     tags: [Appointments]
 *     summary: Check in for appointment — issues a priority token
 */
router.post('/:id/checkin', authenticate, ctrl.checkIn);

/**
 * @swagger
 * /appointments/{id}/cancel:
 *   patch:
 *     tags: [Appointments]
 *     summary: Cancel an appointment
 */
router.patch('/:id/cancel', authenticate, ctrl.cancel);

/**
 * @swagger
 * /appointments/department/{departmentId}:
 *   get:
 *     tags: [Appointments]
 *     summary: Staff view — all appointments for a department on a date
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         schema: { type: string }
 */
router.get('/department/:departmentId',
  authenticate, authorize('staff', 'admin', 'super_admin'), sameDepartment,
  ctrl.getDeptAppointments);

router.patch('/:id/approve',
  authenticate, authorize('staff', 'admin', 'super_admin'),
  auditLog('appointment.approve', 'Appointment'),
  ctrl.approve)

router.patch('/:id/reject',
  authenticate, authorize('staff', 'admin', 'super_admin'),
  auditLog('appointment.reject', 'Appointment'),
  ctrl.reject)

// Upload documents for an appointment (citizen)
router.post('/:id/documents',
  authenticate, authorize('citizen'),
  upload.array('documents', 5),
  ctrl.uploadDocuments);

// Staff reviews a specific document
router.patch('/:id/documents/:docIndex/review',
  authenticate, authorize('staff', 'admin', 'super_admin'),
  ctrl.reviewDocument);

module.exports = router;
