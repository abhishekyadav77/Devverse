import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'token';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd || env.cookieSameSite === 'none', // SameSite=None requires Secure
  sameSite: env.cookieSameSite,
  path: '/',
};

export const signToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn, algorithm: 'HS256' });

export const setAuthCookie = (res, token) =>
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

export const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, cookieOptions);