import api from './api.js';

export const subscribeNewsletter = async (email) => (await api.post('/newsletter', { email })).data.data.message;