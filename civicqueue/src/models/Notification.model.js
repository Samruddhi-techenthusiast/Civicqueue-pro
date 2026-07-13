const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'token_issued', 'token_called', 'token_served', 'token_cancelled',
        'appointment_confirmed', 'appointment_reminder', 'appointment_cancelled',
        'queue_opened', 'queue_paused', 'queue_closed',
        'system', 'custom',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // extra payload
    channel: {
      type: String,
      enum: ['in_app', 'email', 'sms', 'push'],
      default: 'in_app',
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    isSent: { type: Boolean, default: false },
    refModel: { type: String, enum: ['Token', 'Appointment', 'Queue', null], default: null },
    ref: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
