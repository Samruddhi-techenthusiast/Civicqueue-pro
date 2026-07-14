const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         code: { type: string, description: 'Unique short code e.g. REV' }
 *         description: { type: string }
 *         services: { type: array, items: { type: string } }
 *         operatingHours: { type: object }
 *         isActive: { type: boolean }
 */
const operatingHoursSchema = new mongoose.Schema(
  {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '17:00' },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
      maxlength: 150,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 10,
      match: [/^[A-Z0-9]+$/, 'Code must be alphanumeric uppercase'],
    },
    description: { type: String, trim: true, maxlength: 500 },
    services: [{ type: String, trim: true }],
    location: { type: String, trim: true },
    floor: { type: String, trim: true },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    contactPhone: { type: String, trim: true },
    operatingHours: {
      monday: { type: operatingHoursSchema, default: () => ({}) },
      tuesday: { type: operatingHoursSchema, default: () => ({}) },
      wednesday: { type: operatingHoursSchema, default: () => ({}) },
      thursday: { type: operatingHoursSchema, default: () => ({}) },
      friday: { type: operatingHoursSchema, default: () => ({}) },
      saturday: { type: operatingHoursSchema, default: () => ({ isClosed: true }) },
      sunday: { type: operatingHoursSchema, default: () => ({ isClosed: true }) },
    },
    activeCounters: { type: Number, default: 1, min: 0, max: 50 },
    avgServiceTimeMinutes: { type: Number, default: 5, min: 1 },
    maxQueueSize: { type: Number, default: 200 },
    priority: {
      enabled: { type: Boolean, default: true },
      categories: [
        {
          name: { type: String }, // e.g. 'Senior Citizen', 'Disabled', 'Pregnant'
          multiplier: { type: Number, default: 1 }, // lower = higher priority in sort
        },
      ],
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ name: 'text', description: 'text' }); // full-text search

// ── Virtuals ─────────────────────────────────────────────────────────────────
departmentSchema.virtual('staffMembers', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  match: { role: { $in: ['staff', 'admin'] }, isActive: true },
  count: true,
});

module.exports = mongoose.model('Department', departmentSchema);
