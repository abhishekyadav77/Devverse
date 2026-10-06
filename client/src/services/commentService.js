import api from './api.js';

export const listComments = async (blogId, params) => {
  const { data } = await api.get(`/blogs/${blogId}/comments`, { params });
  return { comments: data.data.comments, pagination: data.pagination };
};

export const createComment = async (blogId, payload) =>
  (await api.post(`/blogs/${blogId}/comments`, payload)).data.data.comment;

export const updateComment = async (id, content) => (await api.put(`/comments/${id}`, { content })).data.data.comment;

export const deleteComment = async (id) => {
  await api.delete(`/comments/${id}`);
};

export const likeComment = async (id) => (await api.post(`/comments/${id}/like`)).data.data;
export const unlikeComment = async (id) => (await api.delete(`/comments/${id}/like`)).data.data;