import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const isAllowedOrigin = (origin) => origin === env.clientUrl || (!env.isProd && LOCAL_ORIGIN.test(origin));

// Layer 1: browsers send an Origin header on cross-site writes. If present, it must be our site.
// Layer 2: a custom header that cross-site pages can't set without passing our CORS check.
export const csrfGuard = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('Origin');
  if (origin && !isAllowedOrigin(origin)) {
    return next(ApiError.forbidden('Request blocked by CSRF protection'));
  }
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return next(ApiError.forbidden('Request blocked by CSRF protection'));
  }
  next();
};