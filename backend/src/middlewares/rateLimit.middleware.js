'use strict';
const rateLimit = require('express-rate-limit');

/**
 * express-rate-limit has been a dependency (and RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX /
 * AUTH_RATE_LIMIT_MAX have been sitting in .env) since day one, but nothing in the app
 * ever imported it. This file wires it up:
 *
 *  - apiLimiter: applied to every /api/v1 route, generous limit, protects against
 *    general abuse/scraping.
 *  - authLimiter: applied only to the sensitive auth routes (login, register,
 *    forgot-password, reset-password, refresh), much stricter, protects against
 *    credential-stuffing / brute-force attacks.
 */

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min default
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts against the limit
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

module.exports = { apiLimiter, authLimiter };
