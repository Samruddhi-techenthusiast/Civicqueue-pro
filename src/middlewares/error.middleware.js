const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const handleCastError = (err) =>
  ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return ApiError.conflict(`${field} already exists`);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return ApiError.badRequest('Validation failed', errors);
};

const handleJWTError = () => ApiError.unauthorized('Invalid token');
const handleJWTExpired = () => ApiError.unauthorized('Token expired');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Normalize known Mongoose/JWT errors to ApiError
  if (err instanceof mongoose.Error.CastError) error = handleCastError(err);
  else if (err.code === 11000) error = handleDuplicateKey(err);
  else if (err instanceof mongoose.Error.ValidationError) error = handleValidationError(err);
  else if (err.name === 'JsonWebTokenError') error = handleJWTError();
  else if (err.name === 'TokenExpiredError') error = handleJWTExpired();
  else if (!(err instanceof ApiError)) {
    // Unknown — wrap as 500
    logger.error('Unhandled error', { message: err.message, stack: err.stack });
    error = ApiError.internal(
      process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    );
  }

  // Log operational errors at warn, bugs at error
  if (error.statusCode >= 500) {
    logger.error(error.message, { stack: error.stack, url: req.originalUrl });
  } else {
    logger.warn(`[${error.statusCode}] ${error.message}`, { url: req.originalUrl });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors?.length ? { errors: error.errors } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  });
};

module.exports = errorHandler;
