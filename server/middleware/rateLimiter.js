import rateLimit from 'express-rate-limit';

const handler = (req, res) =>
  res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });

const limiter = (options) =>
  rateLimit({ standardHeaders: 'draft-7', legacyHeaders: false, handler, ...options });

// Whole API (high enough for editor autosave)
export const apiLimiter = limiter({ windowMs: 15 * 60 * 1000, limit: 1000 });

// Brute-force protection: only failed attempts count
export const authLimiter = limiter({ windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true });

// Search runs several queries per request
export const searchLimiter = limiter({ windowMs: 60 * 1000, limit: 60 });

// Stops people bulk-subscribing addresses
export const newsletterLimiter = limiter({ windowMs: 60 * 60 * 1000, limit: 5 });

// Likes, bookmarks and comment likes
export const engagementLimiter = limiter({ windowMs: 60 * 1000, limit: 120 });

// Posting and editing comments
export const commentLimiter = limiter({ windowMs: 5 * 60 * 1000, limit: 20 });
// Image uploads are the most expensive requests we accept
export const uploadLimiter = limiter({ windowMs: 10 * 60 * 1000, limit: 30 });

// Crawlers and link-preview bots: generous, but not unlimited
export const seoLimiter = limiter({ windowMs: 60 * 1000, limit: 300 });

// Per-ACCOUNT login failures, on top of the per-IP limit, so guesses can't be spread over many IPs
export const loginAccountLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `login:${String(req.body?.email || '').toLowerCase().slice(0, 254)}`,
});