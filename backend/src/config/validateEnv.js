'use strict';
const logger = require('../utils/logger');

const REQUIRED_VARS = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

// The .env shipped in this repo intentionally uses obvious placeholder secrets with a
// "CHANGE THEM before deploying" comment. This is the safety net for that comment —
// if NODE_ENV=production and someone forgot to actually change them, fail loudly at
// boot instead of silently running with a guessable JWT secret.
const PLACEHOLDER_MARKERS = ['replace_with', 'change_me', 'example', 'placeholder'];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length) {
    logger.error(`Missing required environment variable(s): ${missing.join(', ')}`);
    logger.error('Copy .env.example to .env and fill in real values before starting the server.');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    const stillPlaceholder = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'].filter((key) =>
      PLACEHOLDER_MARKERS.some((marker) => process.env[key].toLowerCase().includes(marker))
    );
    if (stillPlaceholder.length) {
      logger.error(
        `Refusing to start in production with placeholder value(s) for: ${stillPlaceholder.join(', ')}. ` +
        'Generate real random secrets (e.g. `node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"`) and set them before deploying.'
      );
      process.exit(1);
    }
    if (!process.env.FRONTEND_URL) {
      logger.warn('FRONTEND_URL is not set in production — CORS will fall back to localhost defaults, which is almost certainly wrong for a deployed frontend.');
    }
  }
};

module.exports = validateEnv;
