import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { COOKIE_NAME } from '../utils/token.js';

const loadUserFromToken = async (token) => {
    const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  const user = await User.findById(decoded.id);
  if (!user) throw ApiError.unauthorized('This account no longer exists');
  if (user.status === 'suspended') throw ApiError.forbidden('Your account has been suspended');
  if (user.passwordChangedAt && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
    throw ApiError.unauthorized('Your password was changed. Please log in again');
  }
  return user;
};

// Requires a valid session
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw ApiError.unauthorized('Please log in to continue');
  req.user = await loadUserFromToken(token);
  next();
});

// Attaches req.user when logged in, but never blocks (for public pages that personalise)
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      req.user = await loadUserFromToken(token);
    } catch {
      req.user = undefined;
    }
  }
  next();
});

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };