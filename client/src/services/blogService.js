import api from './api.js';

const withPagination = ({ data }) => ({ blogs: data.data.blogs, pagination: data.pagination });

export const listBlogs = async (params) => withPagination(await api.get('/blogs', { params }));
export const listMyBlogs = async (params) => withPagination(await api.get('/blogs/mine', { params }));
export const getMyStats = async () => (await api.get('/blogs/mine/stats')).data.data.stats;

export const getBlogBySlug = async (slug) => (await api.get(`/blogs/${encodeURIComponent(slug)}`)).data.data.blog;
export const getBlogForEdit = async (id) => (await api.get(`/blogs/manage/${id}`)).data.data.blog;

export const createBlog = async (payload) => (await api.post('/blogs', payload)).data.data.blog;
export const updateBlog = async (id, payload) => (await api.put(`/blogs/${id}`, payload)).data.data.blog;
export const deleteBlog = async (id) => {
  await api.delete(`/blogs/${id}`);
};
export const publishBlog = async (id, body = {}) => (await api.post(`/blogs/${id}/publish`, body)).data.data.blog;
export const unpublishBlog = async (id) => (await api.post(`/blogs/${id}/unpublish`)).data.data.blog;