'use strict';
/**
 * Redis config — fully optional.
 *
 * If REDIS_ENABLED=false OR Redis is unreachable, every cache operation
 * silently becomes a no-op. The app runs correctly without Redis; it simply
 * skips caching and token-blacklist checks.
 */
const logger = require('../utils/logger');

let redisClient = null;
let redisAvailable = false;

// ── In-memory fallback store (used when Redis is absent) ──────────────────────
// Simple Map with TTL — good enough for a single-process dev environment.
const memStore = new Map(); // key → { value, expiresAt }

const memCache = {
  get(key) {
    const entry = memStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) { memStore.delete(key); return null; }
    return entry.value;
  },
  set(key, value, ttlSeconds) {
    memStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  },
  del(key) { memStore.delete(key); },
  delPattern(pattern) {
    // Convert glob-style pattern (e.g. "user:*") to regex
    const re = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    for (const k of memStore.keys()) { if (re.test(k)) memStore.delete(k); }
  },
};

// Periodically evict expired in-memory keys (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of memStore.entries()) {
    if (v.expiresAt && now > v.expiresAt) memStore.delete(k);
  }
}, 5 * 60 * 1000).unref();

// ── Connect (optional) ────────────────────────────────────────────────────────
const connectRedis = () => {
  // Opt-out via env
  if (process.env.REDIS_ENABLED === 'false') {
    logger.info('Redis disabled via REDIS_ENABLED=false — using in-memory cache');
    return createNoopClient();
  }

  try {
    const Redis = require('ioredis');

    const config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      db: parseInt(process.env.REDIS_DB) || 0,
      lazyConnect: true,
      enableReadyCheck: true,
      maxRetriesPerRequest: 1,          // fail fast — don't block the request
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis unreachable after 3 retries — switching to in-memory cache');
          redisAvailable = false;
          return null; // stop retrying
        }
        return Math.min(times * 200, 1000);
      },
    };
    if (process.env.REDIS_PASSWORD) config.password = process.env.REDIS_PASSWORD;

    redisClient = new Redis(config);

    redisClient.on('connect', () => { redisAvailable = true;  logger.info('Redis connected'); });
    redisClient.on('error',   () => { redisAvailable = false; }); // already logged by ioredis
    redisClient.on('close',   () => { redisAvailable = false; });

    return redisClient;
  } catch (err) {
    logger.warn(`ioredis not available (${err.message}) — using in-memory cache`);
    return createNoopClient();
  }
};

// Dummy object that mimics ioredis enough for server.js (.connect / .quit)
const createNoopClient = () => ({
  connect: async () => {},
  quit:    async () => {},
  on:      () => {},
});

const getRedis = () => redisClient;

// ── Unified cache API ─────────────────────────────────────────────────────────
// All methods are async, never throw, and transparently fall back to memStore.
const cache = {
  async get(key) {
    if (redisAvailable && redisClient) {
      try {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch { /* fall through */ }
    }
    return memCache.get(key);
  },

  async set(key, value, ttlSeconds = 300) {
    if (redisAvailable && redisClient) {
      try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch { /* fall through */ }
    }
    memCache.set(key, value, ttlSeconds);
  },

  async del(key) {
    if (redisAvailable && redisClient) {
      try { await redisClient.del(key); } catch { /* non-fatal */ }
    }
    memCache.del(key);
  },

  async delPattern(pattern) {
    if (redisAvailable && redisClient) {
      try {
        const keys = await redisClient.keys(pattern);
        if (keys.length) await redisClient.del(...keys);
        return;
      } catch { /* fall through */ }
    }
    memCache.delPattern(pattern);
  },
};

module.exports = { connectRedis, getRedis, cache };
