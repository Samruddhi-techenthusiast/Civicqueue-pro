const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Queue:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         department: { type: string }
 *         date: { type: string, format: date }
 *         status: { type: string, enum: [open, paused, closed] }
 *         currentSerial: { type: integer }
 *         nowServing: { type: string }
 *         totalServed: { type: integer }
 *         avgServiceTimeMinutes: { type: number }
 */
const queueSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'paused', 'closed'],
      default: 'open',
    },
    currentSerial: { type: Number, default: 0 },
    nowServing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      default: null,
    },
    nowServingNumber: { type: String, default: null },
    activeCounters: { type: Number, default: 1 },
    totalServed: { type: Number, default: 0 },
    totalCancelled: { type: Number, default: 0 },
    avgServiceTimeMinutes: { type: Number, default: 5 },
    pauseReason: { type: String, default: null },
    openedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

queueSchema.index({ department: 1, date: 1 }, { unique: true });
queueSchema.index({ status: 1 });
queueSchema.index({ date: -1 });

// Current queue length (pending tokens count is fetched separately via Token model)
queueSchema.virtual('isOpen').get(function () {
  return this.status === 'open';
});

module.exports = mongoose.model('Queue', queueSchema);
