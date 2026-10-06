import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-z0-9_]+$/, 'Username can only use letters, numbers and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, 'Password is required'], select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 300 },
    website: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    passwordChangedAt: Date,
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  // Used to invalidate tokens issued before a password change
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Returns the raw token (emailed to the user). Only its hash is stored.
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  return rawToken;
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.passwordChangedAt;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);