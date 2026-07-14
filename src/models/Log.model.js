const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorRole: { type: String, default: 'system' },
    action: { type: String, required: true, trim: true }, // e.g. 'token.issue', 'queue.close'
    entity: { type: String, required: true }, // e.g. 'Token', 'Queue'
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    description: { type: String, trim: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

logSchema.index({ actor: 1, createdAt: -1 });
logSchema.index({ entity: 1, entityId: 1 });
logSchema.index({ department: 1, createdAt: -1 });
logSchema.index({ action: 1 });
logSchema.index({ createdAt: -1 });
// TTL: auto-delete logs older than 90 days
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Log', logSchema);
