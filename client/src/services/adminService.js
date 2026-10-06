import api from './api.js';

const paged = async (url, params, key) => {
  const { data } = await api.get(url, { params });
  return { items: data.data[key], pagination: data.pagination };
};

export const getAdminStats = async () => (await api.get('/admin/stats')).data.data;
export const getAdminAnalytics = async (days) => (await api.get('/admin/analytics', { params: { days } })).data.data;

export const listAdminUsers = (params) => paged('/admin/users', params, 'users');
export const suspendUser = async (id) => (await api.patch(`/admin/users/${id}/suspend`)).data.data.user;
export const restoreUser = async (id) => (await api.patch(`/admin/users/${id}/restore`)).data.data.user;

export const listAdminPosts = (params) => paged('/admin/posts', params, 'posts');
export const hidePost = async (id) => (await api.patch(`/admin/posts/${id}/hide`)).data.data.blog;
export const restorePost = async (id) => (await api.patch(`/admin/posts/${id}/restore`)).data.data.blog;
export const deletePost = async (id) => {
  await api.delete(`/admin/posts/${id}`);
};

export const listAdminComments = (params) => paged('/admin/comments', params, 'comments');

export const listAdminTags = (params) => paged('/admin/tags', params, 'tags');
export const renameTag = async (id, name) => (await api.put(`/admin/tags/${id}`, { name })).data.data.tag;
export const deleteTag = async (id) => (await api.delete(`/admin/tags/${id}`)).data.data;

export const createCategory = async (payload) => (await api.post('/categories', payload)).data.data.category;
export const updateCategory = async (id, payload) => (await api.put(`/categories/${id}`, payload)).data.data.category;
export const deleteCategory = async (id, reassignTo) =>
  (await api.delete(`/categories/${id}`, { params: reassignTo ? { reassignTo } : {} })).data.data;