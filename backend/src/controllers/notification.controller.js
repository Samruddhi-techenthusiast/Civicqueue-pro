'use strict';
const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const { getPagination } = require('../utils/helpers');

const getMyNotifications = catchAsync(async (req, res) => {
  const opts = getPagination(req.query);
  const result = await notificationService.getUserNotifications(req.user._id, opts);
  ApiResponse.paginated(res, result.data, result.pagination, 'Notifications fetched');
});

const markRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user._id);
  ApiResponse.success(res, notification, 'Marked as read');
});

const markAllRead = catchAsync(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  ApiResponse.success(res, null, 'All notifications marked as read');
});

module.exports = { getMyNotifications, markRead, markAllRead };
