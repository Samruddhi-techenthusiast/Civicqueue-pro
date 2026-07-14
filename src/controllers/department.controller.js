'use strict';
const deptRepo = require('../repositories/department.repository');
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

module.exports = { create, getAll, getOne, update, remove };
