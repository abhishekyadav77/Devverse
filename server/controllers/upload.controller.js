import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { detectImageType } from '../utils/imageType.js';
import { deleteOwnedAvatar, uploadImage } from '../services/upload.service.js';

// POST /api/uploads/image?purpose=avatar|cover|content   (multipart field: "image")
export const uploadImageFile = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Choose an image to upload');

  // Verify the actual bytes, not the filename or the declared type
  if (!detectImageType(req.file.buffer)) {
    throw ApiError.badRequest('Only JPG, PNG, WebP and GIF images are allowed');
  }

  let uploaded;
  try {
    uploaded = await uploadImage(req.file.buffer, req.purpose, req.user._id);
  } catch (err) {
    console.error('Cloudinary upload failed:', err.message);
    if (err.http_code === 400) throw ApiError.badRequest('That image could not be processed. Try a different file');
    throw new ApiError(502, 'The image could not be uploaded. Please try again');
  }

  if (req.purpose === 'avatar') {
    const previous = req.user.avatar;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: uploaded.url }, { new: true });
    await deleteOwnedAvatar(previous, req.user._id);
    return sendSuccess(res, { url: uploaded.url, user }, 201);
  }

  sendSuccess(res, uploaded, 201);
});

// DELETE /api/uploads/avatar
export const removeAvatar = asyncHandler(async (req, res) => {
  const previous = req.user.avatar;
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: '' }, { new: true });
  await deleteOwnedAvatar(previous, req.user._id);
  sendSuccess(res, { user });
});