import api from './api.js';

export const listNotifications = async (params) => {
  const { data } = await api.get('/notifications', { params });
  return {
    notifications: data.data.notifications,
    unreadCount: data.data.unreadCount,
    pagination: data.pagination,
  };
};

export const getUnreadCount = async () => (await api.get('/notifications/unread-count')).data.data.unreadCount;
export const markRead = async (id) => (await api.patch(`/notifications/${id}/read`)).data.data.unreadCount;
export const markAllRead = async () => (await api.patch('/notifications/read-all')).data.data.unreadCount;