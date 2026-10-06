const WINDOW_MS = 30 * 60 * 1000; // one view per viewer per article per 30 minutes
const MAX_ENTRIES = 50000;
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|embedly|headless|facebookexternalhit|curl|wget|python-requests|httpclient/i;

const seen = new Map(); // "viewer:blogId" -> expiry timestamp

const prune = (now) => {
  for (const [key, expires] of seen) if (expires <= now) seen.delete(key);
};
setInterval(() => prune(Date.now()), 10 * 60 * 1000).unref();

// true when this request should count as a new view. In memory: resets on restart.
export const shouldCountView = (req, blogId) => {
  const userAgent = req.get('user-agent') || '';
  if (!userAgent || BOT_PATTERN.test(userAgent)) return false;

  const viewer = req.user ? `u:${req.user._id}` : `ip:${req.ip}`;
  const key = `${viewer}:${blogId}`;
  const now = Date.now();

  const expires = seen.get(key);
  if (expires && expires > now) return false;

  if (seen.size >= MAX_ENTRIES) {
    prune(now);
    if (seen.size >= MAX_ENTRIES) seen.delete(seen.keys().next().value); // drop the oldest
  }
  seen.delete(key);
  seen.set(key, now + WINDOW_MS);
  return true;
};