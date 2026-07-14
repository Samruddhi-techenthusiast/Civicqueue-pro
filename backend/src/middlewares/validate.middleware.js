const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Run after express-validator chains.
 * Collects errors and throws a 400 ApiError if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({
    field: e.path || e.param,
    message: e.msg,
    value: e.value,
  }));

  throw ApiError.badRequest('Validation failed', formatted);
};

module.exports = validate;
