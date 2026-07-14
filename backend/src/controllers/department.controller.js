'use strict';
const deptRepo = require('../repositories/department.repository');
const Queue = require('../models/Queue.model');
const { cache } = require('../config/redis');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { getPagination, buildSort } = require('../utils/helpers');

const create = catchAsync(async (req, res) => {
  const dept = await deptRepo.create({ ...req.body, createdBy: req.user._id });
  ApiResponse.created(res, dept, 'Department created');
});

const getAll = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = buildSort(req.query.sort, { name: 1 });
  const search = req.query.search;

  const { data, pagination } = search
    ? await deptRepo.search(search, { page, limit, skip, sort })
    : await deptRepo.findAllActive({ page, limit, skip, sort });

  ApiResponse.paginated(res, data, pagination);
});

const getOne = catchAsync(async (req, res) => {
  const dept = await deptRepo.findById(req.params.id);
  if (!dept) throw ApiError.notFound('Department not found');
  ApiResponse.success(res, dept);
});

const update = catchAsync(async (req, res) => {
  const dept = await deptRepo.findByIdAndUpdate(req.params.id, req.body);
  if (!dept) throw ApiError.notFound('Department not found');
  ApiResponse.success(res, dept, 'Department updated');
});

const remove = catchAsync(async (req, res) => {
  const dept = await deptRepo.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!dept) throw ApiError.notFound('Department not found');
  ApiResponse.success(res, null, 'Department deactivated');
});


// Admin configures avg service time and queue settings for a department
const updateSettings = catchAsync(async (req, res) => {
  const { avgServiceTimeMinutes, maxQueueSize, activeCounters } = req.body;
  const update = {};
  if (avgServiceTimeMinutes !== undefined) {
    const v = parseInt(avgServiceTimeMinutes);
    if (isNaN(v) || v < 1 || v > 120)
      throw ApiError.badRequest('avgServiceTimeMinutes must be 1–120');
    update.avgServiceTimeMinutes = v;
  }
  if (maxQueueSize !== undefined) {
    const v = parseInt(maxQueueSize);
    if (isNaN(v) || v < 1 || v > 2000)
      throw ApiError.badRequest('maxQueueSize must be 1–2000');
    update.maxQueueSize = v;
  }
  if (activeCounters !== undefined) {
    const v = parseInt(activeCounters);
    if (isNaN(v) || v < 1 || v > 50)
      throw ApiError.badRequest('activeCounters must be 1–50');
    update.activeCounters = v;
  }
  if (!Object.keys(update).length)
    throw ApiError.badRequest('No settings provided');

  const dept = await deptRepo.findByIdAndUpdate(req.params.id, update);
  if (!dept) throw ApiError.notFound('Department not found');

  // Also sync the today's queue if it exists
  await Queue.updateOne(
    { department: req.params.id, date: new Date().toISOString().slice(0, 10) },
    { $set: { avgServiceTimeMinutes: update.avgServiceTimeMinutes || dept.avgServiceTimeMinutes } }
  );

  // Invalidate cache
  await cache.del(`queue:status:${req.params.id}`);

  ApiResponse.success(res, dept, 'Department settings updated');
});

module.exports = { updateSettings, create, getAll, getOne, update, remove };
