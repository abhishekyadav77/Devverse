import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    // A 401 on any non-auth call means the session expired mid-use
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'The request timed out' : null) ||
      (error.request && !error.response ? 'Cannot reach the server' : null) ||
      error.message ||
      'Something went wrong';
    return Promise.reject(Object.assign(error, { message }));
  }
);

export default api;