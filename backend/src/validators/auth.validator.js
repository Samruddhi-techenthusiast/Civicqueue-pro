const { body } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Valid Indian mobile number required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and a number'),
  body('role').optional().isIn(['citizen', 'staff', 'admin']).withMessage('Invalid role'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// refreshToken is optional in the body because the browser client now relies on the
// httpOnly cookie set at login; non-browser API clients (Postman, mobile apps) may
// still pass it explicitly in the body. The controller checks the cookie first, then
// falls back to the body, and returns a clear 400 if neither is present.
const refreshTokenRules = [
  body('refreshToken').optional().isString().notEmpty().withMessage('refreshToken must be a non-empty string if provided'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and a number'),
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and a number'),
];

module.exports = {
  registerRules,
  loginRules,
  refreshTokenRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
};
