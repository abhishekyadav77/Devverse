import api from './api.js';

export const getCategories = async (params) => (await api.get('/categories', { params })).data.data.categories;
export const getCategory = async (slug) =>
  (await api.get(`/categories/${encodeURIComponent(slug)}`)).data.data.category;

export const getTags = async (q = '') => (await api.get('/tags', { params: q ? { q } : {} })).data.data.tags;
export const getPopularTags = async () => (await api.get('/tags/popular')).data.data.tags;
export const getTag = async (slug) => (await api.get(`/tags/${encodeURIComponent(slug)}`)).data.data.tag;