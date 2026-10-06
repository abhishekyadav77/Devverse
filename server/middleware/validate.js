import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(ApiError.badRequest(result.error.issues[0].message));
  }
  req.body = result.data; // sanitized: trimmed, lowercased, unknown keys removed
  next();
};