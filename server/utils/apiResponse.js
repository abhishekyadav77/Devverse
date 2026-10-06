export const sendSuccess = (res, data = null, statusCode = 200, extra = {}) =>
  res.status(statusCode).json({ success: true, data, ...extra });
