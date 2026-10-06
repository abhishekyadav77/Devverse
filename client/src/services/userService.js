import api from './api.js';

// Returns { user, isFollowing }
export const getAuthor = async (username) =>
  (await api.get(`/users/${encodeURIComponent(username)}`)).data.data;

export const getFollowState = async (userId) => (await api.get(`/users/${userId}/follow`)).data.data.following;
export const followUser = async (userId) => (await api.post(`/users/${userId}/follow`)).data.data;
export const unfollowUser = async (userId) => (await api.delete(`/users/${userId}/follow`)).data.data;