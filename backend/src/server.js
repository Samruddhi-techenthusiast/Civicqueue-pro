'use strict';
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const createApp = require('./app');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const validateEnv = require('./config/validateEnv');
const initSockets = require('./sockets/socket.server');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  // 0. Fail fast on missing/placeholder config instead of a confusing crash later
  validateEnv();

  // 1. MongoDB — required
  await connectDB();

  // 2. Redis — fully optional, never crashes the app
  const redisClient = connectRedis();
  try {
    await redisClient.connect();
  } catch (err) {
    logger.warn(`Redis unavailable (${err.message}) — running with in-memory cache`);
  }

  // 3. Express app + HTTP server
  const app = createApp();
  const server = http.createServer(app);

  // 4. Socket.io
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });
  initSockets(io);

  // 5. Start listening
  server.listen(PORT, () => {
    logger.info(`
╔════════════════════════════════════════════╗
║   CivicQueue API  →  http://localhost:${PORT}  ║
║   Docs           →  /api-docs              ║
║   Env            →  ${(process.env.NODE_ENV || 'development').padEnd(27)}║
╚════════════════════════════════════════════╝`);
  });

  // 6. Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} — graceful shutdown`);
    server.close(async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB closed');
        await redisClient.quit();
        logger.info('Redis closed');
      } catch { /* ignore errors during shutdown */ }
      process.exit(0);
    });
    setTimeout(() => { logger.error('Forced exit after timeout'); process.exit(1); }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => { logger.error('Unhandled Rejection', { reason }); process.exit(1); });
  process.on('uncaughtException',  (err)    => { logger.error('Uncaught Exception',  { err: err.message, stack: err.stack }); process.exit(1); });

  return server;
};

bootstrap().catch((err) => { console.error('Failed to start:', err); process.exit(1); });
