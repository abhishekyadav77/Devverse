import crypto from 'crypto';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';

const ROOT = 'devverse';

export const PRESETS = {
  avatar: { folder: 'avatars', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'auto' }] },
  cover: { folder: 'posts', transformation: [{ width: 1600, height: 1600, crop: 'limit' }] },
  content: { folder: 'posts', transformation: [{ width: 1600, height: 1600, crop: 'limit' }] },
};

export const isValidPurpose = (value) => typeof value === 'string' && Object.hasOwn(PRESETS, value);

// Adds automatic format + quality (WebP/AVIF where supported) to the delivered URL
const withDeliveryOptimizations = (url) => url.replace('/image/upload/', '/image/upload/f_auto,q_auto/');

export const uploadImage = async (buffer, purpose, userId) => {
  const preset = PRESETS[purpose];
  // The user id in the name lets us prove who owns an asset before deleting it
  const publicId = `${ROOT}/${preset.folder}/${userId}-${crypto.randomBytes(6).toString('hex')}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'image', overwrite: false, transformation: preset.transformation },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(buffer);
  });

  return { url: withDeliveryOptimizations(result.secure_url), width: result.width, height: result.height };
};

const publicIdFromUrl = (url = '') => {
  if (!url.includes(`res.cloudinary.com/${env.cloudinary.cloudName}/`)) return null;
  const match = url.match(/\/image\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(devverse\/[^.?]+)\.[a-z0-9]+(?:\?.*)?$/i);
  return match ? match[1] : null;
};

// Deletes an avatar from Cloudinary, only if it is one of this user's own uploads. Never throws.
export const deleteOwnedAvatar = async (url, userId) => {
  if (!isCloudinaryConfigured) return;
  const publicId = publicIdFromUrl(url);
  if (!publicId || !publicId.startsWith(`${ROOT}/avatars/${userId}-`)) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  } catch (err) {
    console.error('Could not delete old avatar:', err.message);
  }
};