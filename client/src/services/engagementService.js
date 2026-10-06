import api from './api.js';

export const getLikeState = async (blogId) => (await api.get(`/blogs/${blogId}/like`)).data.data.liked;
export const likeBlog = async (blogId) => (await api.post(`/blogs/${blogId}/like`)).data.data;
export const unlikeBlog = async (blogId) => (await api.delete(`/blogs/${blogId}/like`)).data.data;

export const bookmarkBlog = async (blogId) => {
  await api.post(`/blogs/${blogId}/bookmark`);
};
export const unbookmarkBlog = async (blogId) => {
  await api.delete(`/blogs/${blogId}/bookmark`);
};

export const getBookmarkIds = async () => (await api.get('/users/bookmarks/ids')).data.data.ids;

export const listBookmarks = async (params) => {
  const { data } = await api.get('/users/bookmarks', { params });
  return { blogs: data.data.blogs, pagination: data.pagination };
};