const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         citizen: { type: string }
 *         department: { type: string }
 *         date: { type: string, format: date }
 *         timeSlot: { type: object }
 *         status: { type: string, enum: [scheduled, confirmed, checked_in, completed, cancelled, no_show] }
 */
// models/Appointment.model.js — CORRECTED VERSION
const appointmentSchema = new mongoose.Schema({
  citizen:    { type: ObjectId, ref: 'User', required: true },
  department: { type: ObjectId, ref: 'Department', required: true },
  date:       { type: String, required: true },
  timeSlot: {
    start: { type: String, required: true },
    end:   { type: String, required: true },
  },
  serviceType:      { type: String, default: 'General' },
  confirmationCode: { type: String, required: true, unique: true },

  status: {
    type: String,
    // FIX 5: Add 'pending_approval' as initial state, 'rejected' as terminal state
    enum: ['pending_approval', 'scheduled', 'confirmed', 'checked_in',
           'completed', 'cancelled', 'no_show', 'rejected'],
    default: 'pending_approval',  // Staff must approve before it's real
  },

  // Approval tracking
  approvedBy:   { type: ObjectId, ref: 'User', default: null },
  approvedAt:   { type: Date, default: null },
  rejectedBy:   { type: ObjectId, ref: 'User', default: null },
  rejectedAt:   { type: Date, default: null },
  rejectReason: { type: String, default: null },

  // Check-in tracking
  checkedInAt: { type: Date, default: null },
  tokenRef:    { type: ObjectId, ref: 'Token', default: null },

  // FIX 10: Optimistic lock for preventing double check-in
  checkInLock: { type: Boolean, default: false },

  notes:         { type: String, maxlength: 500 },
  cancelReason:  { type: String, default: null },
  cancelledAt:   { type: Date, default: null },
  reminderSent:  { type: Boolean, default: false },
  priority:      { type: String, enum: ['normal','high','urgent'], default: 'normal' },
  bookedBy:      { type: ObjectId, ref: 'User' },
  documents: [
    {
      name:       { type: String, trim: true },
      url:        { type: String },
      mimeType:   { type: String },
      uploadedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 're_upload_required'],
        default: 'pending',
      },
      reviewedBy: { type: ObjectId, ref: 'User', default: null },
      remarks:    { type: String, default: null },
    },
  ],

}, { timestamps: true })

appointmentSchema.index({ department: 1, date: 1, status: 1 })
appointmentSchema.index({ citizen: 1, date: -1 })
appointmentSchema.index({ department: 1, date: 1, 'timeSlot.start': 1 })

module.exports = mongoose.model('Appointment', appointmentSchema);
