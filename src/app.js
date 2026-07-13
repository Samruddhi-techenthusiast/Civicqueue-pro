'use strict';
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const v1Router = require('./routes/v1/index');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');
const logger = require('./utils/logger');

const createApp = () => {
  const app = express();

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  }));
  app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ── Parsing & sanitization ────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(mongoSanitize()); // prevent NoSQL injection

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
  app.use('/api/v1', v1Router);

  // Root health check
  app.get('/', (req, res) => res.json({ app: 'CivicQueue', status: 'running', docs: '/api-docs' }));

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((req, res, next) => next(ApiError.notFound(`Route ${req.originalUrl} not found`)));

  // ── Centralized error handler ─────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
