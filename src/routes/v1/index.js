const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const departmentRoutes = require('./department.routes');
const queueRoutes = require('./queue.routes');
const appointmentRoutes = require('./appointment.routes');
const { notifRouter, analyticsRouter, usersRouter } = require('./misc.routes');

router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/queue', queueRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/notifications', notifRouter);
router.use('/analytics', analyticsRouter);
router.use('/users', usersRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CivicQueue API is healthy',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
