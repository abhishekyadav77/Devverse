import multer from 'multer';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { isValidPurpose } from '../services/upload.service.js';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 5, parts: 6 },
  fileFilter: (req, file, cb) =>
    ALLOWED_TYPES.has(file.mimetype)
      ? cb(null, true)
      : cb(ApiError.badRequest('Only JPG, PNG, WebP and GIF images are allowed')),
});

export const singleImage = upload.single('image');

export const requireCloudinary = (req, res, next) => {
  if (!isCloudinaryConfigured) return next(new ApiError(503, 'Image uploads are not set up on this server yet'));
  next();
};

// Runs BEFORE the file is read, so a bad request never buffers an upload
export const requirePurpose = (req, res, next) => {
  const purpose = req.query.purpose;
  if (!isValidPurpose(purpose)) return next(ApiError.badRequest('Unknown upload type'));
  req.purpose = purpose;
  next();
};