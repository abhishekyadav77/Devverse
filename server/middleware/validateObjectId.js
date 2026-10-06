import { ApiError } from '../utils/ApiError.js';

// Use with router.param('id', validateObjectId)
export const validateObjectId = (req, res, next, value) => {
  if (!/^[a-f\d]{24}$/i.test(value)) return next(ApiError.badRequest('Invalid id'));
  next();
};