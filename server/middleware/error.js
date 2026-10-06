import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Central error handler: every error leaves the API as { success:false, message }.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already taken`;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session is invalid or expired. Please log in again';
      } else if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      message = 'Image must be 5 MB or smaller';
    } else {
      statusCode = 400;
      message =
        err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT'
          ? 'Upload a single image'
          : 'The upload was not valid';
    }
      } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'That request is too large';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  if (statusCode >= 500) {
    console.error(err);
    if (env.isProd) message = 'Something went wrong';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isProd ? {} : { stack: err.stack }),
  });
};
