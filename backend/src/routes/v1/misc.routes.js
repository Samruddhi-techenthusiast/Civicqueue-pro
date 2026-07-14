'use strict';

const express = require('express');

// routers
const notifRouter = express.Router();
const analyticsRouter = express.Router();
const usersRouter = express.Router();

// controllers
const notifCtrl = require('../../controllers/notification.controller');
const analyticsCtrl = require('../../controllers/analytics.controller');
const userCtrl = require('../../controllers/user.controller');

const { authenticate, authorize } = require('../../middlewares/auth.middleware');


// ───────── Notifications ─────────
notifRouter.get('/', authenticate, notifCtrl.getMyNotifications);
notifRouter.patch('/:id/read', authenticate, notifCtrl.markRead);
notifRouter.patch('/read-all', authenticate, notifCtrl.markAllRead);


// ───────── Analytics ─────────
analyticsRouter.get('/overview', authenticate, authorize('admin', 'super_admin'), analyticsCtrl.getOverview);

analyticsRouter.get('/weekly', authenticate, authorize('admin', 'super_admin'), analyticsCtrl.getWeeklyOverview);

analyticsRouter.get('/department/:departmentId',
  authenticate,
  authorize('staff', 'admin', 'super_admin'),
  analyticsCtrl.getDepartmentStats
);




analyticsRouter.get('/departments/performance',
  authenticate, authorize('admin', 'super_admin'),
  analyticsCtrl.getDeptPerformance);

analyticsRouter.get('/department/:departmentId/staff',
  authenticate,
  authorize('staff', 'admin', 'super_admin'),
  analyticsCtrl.getStaffPerformance
);

analyticsRouter.get('/my-workload',
  authenticate,
  authorize('staff', 'admin', 'super_admin'),
  analyticsCtrl.getMyWorkload
);

// ───────── Users ─────────
usersRouter.get('/',          authenticate, authorize('admin', 'super_admin'), userCtrl.getAllUsers);
usersRouter.patch('/profile', authenticate, userCtrl.updateProfile);
usersRouter.get('/:id',       authenticate, authorize('admin', 'super_admin'), userCtrl.getUser);
usersRouter.patch('/:id',     authenticate, authorize('admin', 'super_admin'), userCtrl.updateUser);
usersRouter.delete('/:id',    authenticate, authorize('super_admin'), userCtrl.deactivateUser);


// ───────── EXPORT ─────────
module.exports = {
  notifRouter,
  analyticsRouter,
  usersRouter
};