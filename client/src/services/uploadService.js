import api from './api.js';

// purpose: 'avatar' | 'cover' | 'content'.
// Resolves to { url, width, height } (avatar uploads also return the updated { user }).
export const uploadImage = async (file, purpose, onProgress) => {
  const body = new FormData();
  body.append('image', file);
  const { data } = await api.post('/uploads/image', body, {
    params: { purpose },
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // uploads can take longer than normal requests
    onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
  });
  return data.data;
};

export const removeAvatar = async () => (await api.delete('/uploads/avatar')).data.data.user;