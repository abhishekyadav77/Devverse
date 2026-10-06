export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Quick check in the browser so people get instant feedback. The server re-checks everything.
export const validateImageFile = (file) => {
  if (!file) return 'Choose an image first';
  if (!ALLOWED_TYPES.includes(file.type)) return 'Use a JPG, PNG, WebP or GIF image';
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be 5 MB or smaller';
  return '';
};

// Asks Cloudinary for a smaller version (cards don't need 1600px). Other URLs pass through unchanged.
export const optimizeImage = (url, width) => {
  const marker = '/image/upload/f_auto,q_auto/';
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com') || !url.includes(marker)) return url;
  return url.replace(marker, `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
};