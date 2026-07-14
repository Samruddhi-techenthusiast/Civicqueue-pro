const Log = require('../models/Log.model');

/**
 * Factory: returns a middleware that writes an audit log entry after the response.
 * Usage:  router.post('/tokens', auditLog('token.issue', 'Token'), handler)
 */
const auditLog = (action, entity) => (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    // Only log successful mutations
    if (res.statusCode < 400) {
      const entityId = body?.data?._id || body?.data?.id || null;
      Log.create({
        actor: req.user?._id || null,
        actorRole: req.user?.role || 'anonymous',
        action,
        entity,
        entityId,
        department: req.user?.department || req.params?.departmentId || null,
        description: `${action} by ${req.user?.email || 'anonymous'}`,
        meta: { params: req.params, query: req.query },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(() => {}); // non-blocking
    }
    return originalJson(body);
  };

  next();
};

module.exports = auditLog;
