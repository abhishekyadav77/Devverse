import api from './api.js';

export const registerUser = async (payload) => (await api.post('/auth/register', payload)).data.data.user;

export const loginUser = async (payload) => (await api.post('/auth/login', payload)).data.data.user;

export const logoutUser = async () => {
  await api.post('/auth/logout');
};

// Returns null when there is no valid session (a 401 is expected for guests)
export const fetchMe = async () => {
  try {
    return (await api.get('/auth/me')).data.data.user;
  } catch (err) {
    if (err.response?.status === 401) return null;
    throw err;
  }
};

export const forgotPassword = async (email) => (await api.post('/auth/forgot-password', { email })).data.data.message;

export const resetPassword = async (token, password) =>
  (await api.post('/auth/reset-password', { token, password })).data.data.message;

export const changePassword = async (payload) => (await api.put('/auth/change-password', payload)).data.data.message;

export const updateProfile = async (payload) => (await api.put('/users/profile', payload)).data.data.user;