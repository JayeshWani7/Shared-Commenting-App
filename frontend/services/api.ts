import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  
  getProfile: (token: string) =>
    api.get('/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Comments API
export const commentsApi = {
  getComments: (page: number = 1, limit: number = 20) =>
    api.get(`/comments?page=${page}&limit=${limit}`),
  
  getComment: (id: string) =>
    api.get(`/comments/${id}`),
  
  createComment: (data: { content: string; parentId?: string }) =>
    api.post('/comments', data),
  
  updateComment: (id: string, data: { content: string }) =>
    api.put(`/comments/${id}`, data),
  
  deleteComment: (id: string) =>
    api.delete(`/comments/${id}`),
  
  restoreComment: (id: string) =>
    api.put(`/comments/${id}/restore`),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (page: number = 1, limit: number = 20) =>
    api.get(`/notifications?page=${page}&limit=${limit}`),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
  
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.put('/notifications/mark-all-read'),
};

export default api;
