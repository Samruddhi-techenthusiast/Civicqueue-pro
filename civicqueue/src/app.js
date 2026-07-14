'use strict';
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const v1Router = require('./routes/v1/index');
const errorHandler = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/rateLimit.middleware');
const ApiError = require('./utils/ApiError');
const logger = require('./utils/logger');

const createApp = () => {
  const app = express();

  // Render/Railway/Vercel/Heroku-style hosts sit behind a reverse proxy. Without this,
  // Express thinks every request is plain HTTP (breaking `secure: true` cookies) and
  // express-rate-limit sees the proxy's IP for every user instead of the real client IP.
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  }));
  // `credentials: true` + a wildcard '*' origin is rejected by browsers anyway,
  // and if it were ever honored it would allow any site to send authenticated
  // requests. FRONTEND_URL now supports a comma-separated list and there is no
  // wildcard fallback — an explicit whitelist only.
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl/Postman/server-to-server — no Origin header
      if (allowedOrigins.includes(origin)) return callback(null, true);
      logger.warn(`CORS blocked request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ── Parsing & sanitization ────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser()); // required so req.cookies is ever defined (auth controller reads req.cookies.refreshToken)
  app.use(mongoSanitize()); // prevent NoSQL injection
  app.use(xss()); // sanitize user input against stored XSS payloads

  // ── Performance ───────────────────────────────────────────────────────────
  app.use(compression());

  // ── Logging ───────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: logger.stream }));
  }

  // ── API docs ──────────────────────────────────────────────────────────────
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CivicQueue API Docs',
    customCss: '.swagger-ui .topbar { background: #1a1a2e }',
  }));

  // ── Routes ────────────────────────────────────────────────────────────────
  // General rate limit on every API route; auth.routes.js applies a stricter,
  // failure-only limiter on top of this for login/register/password endpoints.
  app.use('/api/v1', apiLimiter, v1Router);

  // Root health check
  app.get('/', (req, res) => res.json({ app: 'CivicQueue', status: 'running', docs: '/api-docs' }));

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((req, res, next) => next(ApiError.notFound(`Route ${req.originalUrl} not found`)));

  // ── Centralized error handler ─────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
