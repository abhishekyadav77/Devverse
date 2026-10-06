import api from './api.js';

export const searchBlogs = async (params) => {
  const { data } = await api.get('/search', { params });
  return { blogs: data.data.blogs, query: data.data.query, pagination: data.pagination };
};