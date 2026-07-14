const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/auth.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { authLimiter } = require('../../middlewares/rateLimit.middleware');
const validate = require('../../middlewares/validate.middleware');
const {
  registerRules, loginRules, refreshTokenRules,
  changePasswordRules, forgotPasswordRules, resetPasswordRules,
} = require('../../validators/auth.validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & session management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Rahul Sharma }
 *               email: { type: string, format: email }
 *               phone: { type: string, example: '9876543210' }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [citizen, staff, admin] }
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post('/register', authLimiter, registerRules, validate, ctrl.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful — returns accessToken + refreshToken
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, loginRules, validate, ctrl.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New token pair issued
 */
router.post('/refresh', authLimiter, refreshTokenRules, validate, ctrl.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current session
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authenticate, ctrl.logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Logout all sessions
 */
router.post('/logout-all', authenticate, ctrl.logoutAll);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/me', authenticate, ctrl.getMe);

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     tags: [Auth]
 *     summary: Change password
 */
router.patch('/change-password', authenticate, changePasswordRules, validate, ctrl.changePassword);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     security: []
 */
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, ctrl.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 *     security: []
 */
router.post('/reset-password', authLimiter, resetPasswordRules, validate, ctrl.resetPassword);


// Admin-only: create a staff account directly (bypasses self-registration flow)
router.post('/create-staff',
  authenticate, authorize('admin', 'super_admin'),
  ctrl.createStaff);

module.exports = router;
