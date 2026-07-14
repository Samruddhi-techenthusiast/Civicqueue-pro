'use strict';
// Runs once before any test file, via jest.config's globalSetup-equivalent
// (see package.json "jest" block) — sets required env vars BEFORE app.js /
// auth.service.js etc. are ever required, since several of them read
// process.env at module-load time.
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_do_not_use_in_prod';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_do_not_use_in_prod';
process.env.JWT_ACCESS_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE = '7d';
process.env.REDIS_ENABLED = 'false'; // use the in-memory cache fallback, no real Redis needed
process.env.RATE_LIMIT_MAX = '1000';
process.env.AUTH_RATE_LIMIT_MAX = '1000'; // generous so intentionally-failing test cases never trip the real limiter
process.env.FRONTEND_URL = 'http://localhost:5173';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connect, closeDatabase, clearDatabase };
