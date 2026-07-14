const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { cache } = require('../config/redis');

/**
 * Verify JWT access token and attach user to req
 */
const authenticate = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) throw ApiError.unauthorized('Access token required');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Access token expired');
    throw ApiError.unauthorized('Invalid access token');
  }

  // Check blacklist (logout tokens stored in Redis)
  const isBlacklisted = await cache.get(`bl:${token}`);
  if (isBlacklisted) throw ApiError.unauthorized('Token has been revoked');

  // Cache user for repeated requests (60s TTL)
  let user = await cache.get(`user:${decoded.id}`);
  if (!user) {
    user = await User.findById(decoded.id).select('+loginAttempts').lean();
    if (user) await cache.set(`user:${decoded.id}`, user, 60);
  }

  if (!user) throw ApiError.unauthorized('User not found');
  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

  req.user = user;
  req.token = token;
  next();
});

/**
 * Role-based access control
 * Usage: authorize('admin', 'super_admin')
 */
const authorize = (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Role '${req.user.role}' is not allowed`));
    }
    next();
  };

/**
 * Soft authentication — attach user if token present, don't fail if absent
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (user?.isActive) req.user = user;
  } catch { /* ignore */ }
  next();
});

/**
 * Ensure staff belongs to the requested department
 * Uses :departmentId param or req.body.department
 */
const sameDepartment = (req, res, next) => {
  if (['super_admin', 'admin'].includes(req.user.role)) return next();

  const deptId = req.params.departmentId || req.body.department;
  if (!deptId) return next(ApiError.badRequest('Department not specified'));

  if (req.user.department?.toString() !== deptId.toString()) {
    return next(ApiError.forbidden('Access restricted to your department'));
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth, sameDepartment };
