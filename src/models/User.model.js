const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         phone: { type: string }
 *         role: { type: string, enum: [citizen, staff, admin, super_admin] }
 *         department: { type: string, description: ObjectId ref }
 *         isActive: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['citizen', 'staff', 'admin', 'super_admin'],
      default: 'citizen',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },
    refreshTokens: [{ type: String, select: false }],
    preferences: {
      language: { type: String, default: 'en' },
      notifications: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, role: 1 });

// ── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Hooks ────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Methods ──────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 min
  }
  return this.updateOne(updates);
};

userSchema.methods.hasRole = function (...roles) {
  return roles.includes(this.role);
};

module.exports = mongoose.model('User', userSchema);
