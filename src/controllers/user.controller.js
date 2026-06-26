'use strict';
const userRepo = require('../repositories/user.repository');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { getPagination, buildSort } = require('../utils/helpers');
const { cache } = require('../config/redis');

const getAllUsers = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = buildSort(req.query.sort);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.department) filter.department = req.query.department;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const result = req.query.search
    ? await userRepo.searchUsers(req.query.search, filter, { page, limit, skip, sort })
    : await userRepo.paginate(filter, {
        page, limit, skip, sort,
        populate: [{ path: 'department', select: 'name code' }],
      });

  ApiResponse.paginated(res, result.data, result.pagination);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userRepo.findById(req.params.id, {
    populate: [{ path: 'department', select: 'name code' }],
  });
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, user);
});

const updateUser = catchAsync(async (req, res) => {
  // Prevent role escalation unless super_admin
  if (req.body.role && req.user.role !== 'super_admin')
    throw ApiError.forbidden('Only super_admin can change roles');

  const { password, refreshTokens, ...safeUpdate } = req.body;
  const user = await userRepo.findByIdAndUpdate(req.params.id, safeUpdate);
  if (!user) throw ApiError.notFound('User not found');
  await cache.del(`user:${req.params.id}`);
  ApiResponse.success(res, user, 'User updated');
});

const deactivateUser = catchAsync(async (req, res) => {
  const user = await userRepo.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!user) throw ApiError.notFound('User not found');
  await cache.del(`user:${req.params.id}`);
  ApiResponse.success(res, null, 'User deactivated');
});

const updateProfile = catchAsync(async (req, res) => {
  const { name, phone, preferences } = req.body;
  const user = await userRepo.findByIdAndUpdate(req.user._id, { name, phone, preferences });
  await cache.del(`user:${req.user._id}`);
  ApiResponse.success(res, user, 'Profile updated');
});

module.exports = { getAllUsers, getUser, updateUser, deactivateUser, updateProfile };
