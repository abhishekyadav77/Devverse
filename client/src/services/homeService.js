import api from './api.js';

export const getHome = async () => (await api.get('/home')).data.data;