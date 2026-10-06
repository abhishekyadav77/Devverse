import crypto from 'crypto';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { sendPasswordResetEmail } from '../services/email.service.js';
import bcrypt from 'bcryptjs';

const startSession = (res, user) => setAuthCookie(res, signToken(user._id));

// Used so a login attempt for an unknown email still performs one bcrypt comparison
const DUMMY_HASH = bcrypt.hashSync('devverse-timing-guard', 12);

export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (await User.exists({ email })) throw new ApiError(409, 'An account with that email already exists');
  if (await User.exists({ username })) throw new ApiError(409, 'That username is already taken');

  // role is never read from the request: everyone registers as a normal user
  const user = await User.create({ name, username, email, password });
  startSession(res, user);
  sendSuccess(res, { user }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  // Always run exactly one bcrypt comparison, so response time doesn't reveal whether the email exists
  const passwordOk = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  // Same message for unknown email and wrong password
  if (!user || !passwordOk) throw ApiError.unauthorized('Invalid email or password');
  if (user.status === 'suspended') throw ApiError.forbidden('Your account has been suspended');

  startSession(res, user);
  sendSuccess(res, { user });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, { message: 'Logged out' });
});

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const genericReply = { message: 'If an account exists for that email, a reset link has been sent.' };
  const user = await User.findOne({ email: req.body.email, status: 'active' });

  if (user) {
    const rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl: `${env.clientUrl}/reset-password/${rawToken}` });
    } catch (err) {
      console.error('Failed to send reset email:', err.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }
  // Identical response whether or not the account exists (prevents email enumeration)
  sendSuccess(res, genericReply);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired');

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendSuccess(res, { message: 'Password updated. You can now log in.' });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  user.password = req.body.newPassword;
  await user.save();

  startSession(res, user); // fresh cookie; older sessions are now invalid
  sendSuccess(res, { message: 'Password changed' });
});