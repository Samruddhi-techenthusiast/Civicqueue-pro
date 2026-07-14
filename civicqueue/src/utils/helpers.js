const crypto = require('crypto');
const QRCode = require('qrcode');

/**
 * Generate a paginated query response shape
 */
const paginateQuery = (total, page, limit) => ({
  total,
  page: parseInt(page),
  limit: parseInt(limit),
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

/**
 * Build Mongoose skip/limit from query params
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build Mongoose sort from query string  e.g. "-createdAt,name"
 */
const buildSort = (sortStr, defaultSort = { createdAt: -1 }) => {
  if (!sortStr) return defaultSort;
  return sortStr.split(',').reduce((acc, field) => {
    if (field.startsWith('-')) acc[field.slice(1)] = -1;
    else acc[field] = 1;
    return acc;
  }, {});
};

/**
 * Generate a short alphanumeric token number for queue display
 * Format: DEPT-XXX  e.g. REV-047
 */
const generateTokenNumber = (deptCode, serial) => {
  const code = (deptCode || 'GEN').substring(0, 3).toUpperCase();
  const num = String(serial).padStart(3, '0');
  return `${code}-${num}`;
};

/**
 * Estimate waiting time in minutes.
 *
 * Real-world formula:
 *   peopleAhead = position - 1   (tokens waiting before this one)
 *   EWT = ceil(peopleAhead × avgServiceTime / activeCounters)
 *
 * When position = 1 → EWT = 0 (next to be called)
 * Example from prompt: token A-20, now serving A-12 → 8 people ahead, 5min avg, 1 counter
 *   → EWT = 8 × 5 / 1 = 40 minutes ✓
 *
 * @param {number} position       1-based queue position of this token
 * @param {number} avgServiceTime Average service time in minutes per token
 * @param {number} activeCounters Number of active staff counters
 */
const calculateEWT = (position, avgServiceTime = 5, activeCounters = 1) => {
  if (!position || position <= 0) return 0;
  const peopleAhead = position - 1;
  if (peopleAhead <= 0) return 0;
  return Math.ceil((peopleAhead * avgServiceTime) / Math.max(1, activeCounters));
};

/**
 * Generate a secure random hex string
 */
const generateSecureToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

/**
 * Generate QR code as base64 data URL for a token
 */
const generateQRCode = async (tokenId) => {
  const url = `${process.env.QR_BASE_URL}/${tokenId}`;
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    width: 256,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
};

/**
 * Sanitize search query to prevent regex injection
 */
const sanitizeSearch = (str) =>
  str ? str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim() : '';

/**
 * Format date to readable string
 */
const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

module.exports = {
  paginateQuery,
  getPagination,
  buildSort,
  generateTokenNumber,
  calculateEWT,
  generateSecureToken,
  generateQRCode,
  sanitizeSearch,
  formatDate,
};
