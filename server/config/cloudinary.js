import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

const { cloudName, apiKey, apiSecret } = env.cloudinary;

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
} else {
  console.warn('Cloudinary is not configured. Image uploads are disabled until the CLOUDINARY_* variables are set.');
}

export { cloudinary };