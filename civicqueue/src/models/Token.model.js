const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         tokenNumber: { type: string, example: 'REV-042' }
 *         citizen: { type: string }
 *         department: { type: string }
 *         queue: { type: string }
 *         status: { type: string, enum: [waiting, serving, served, cancelled, no_show] }
 *         priority: { type: string, enum: [normal, high, urgent] }
 *         estimatedWaitMinutes: { type: integer }
 *         qrCode: { type: string, description: base64 data URL }
 */
const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: { type: String, required: true },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = walk-in (no account)
    },
    citizenName: { type: String, trim: true },
    citizenPhone: { type: String, trim: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: true,
    },
    serviceType: { type: String, trim: true, default: 'General' },
    status: {
      type: String,
      enum: ['waiting', 'serving', 'served', 'cancelled', 'no_show'],
      default: 'waiting',
    },
    priority: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal',
    },
    priorityOrder: {
    type: Number,
    default: 1
  },
    priorityReason: { type: String, default: null },
    serial: { type: Number, required: true }, // sequential within queue
    position: { type: Number, default: null }, // live position (recalculated)
    estimatedWaitMinutes: { type: Number, default: 0 },
    qrCode: { type: String, default: null },
    verificationCode: { type: String, select: false }, // short code for QR verify
    issuedAt: { type: Date, default: Date.now },
    calledAt: { type: Date, default: null },
    servingStartedAt: { type: Date, default: null },
    servedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    servedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    counter: { type: String, default: null }, // e.g. 'Counter 2'
    notes: { type: String, default: null },
    appointmentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    date: { type: String, required: true }, // YYYY-MM-DD for fast day-scoped queries
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
tokenSchema.index({ queue: 1, status: 1 });
tokenSchema.index({ queue: 1, serial: 1 });
tokenSchema.index({ department: 1, date: 1, status: 1 });
tokenSchema.index({ citizen: 1, createdAt: -1 });
tokenSchema.index({ tokenNumber: 1 });
tokenSchema.index({ status: 1, priority: 1, serial: 1 }); // for queue ordering
tokenSchema.index({ date: -1 });

tokenSchema.virtual('waitDurationMinutes').get(function () {
  if (!this.servedAt || !this.issuedAt) return null;
  return Math.round((this.servedAt - this.issuedAt) / 60000);
});

module.exports = mongoose.model('Token', tokenSchema);
