import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle auth errors
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

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  googleLogin: () => {
    window.location.href = `${API_URL}/auth/google`;
  },
};

// Group endpoints
export const groupAPI = {
  create: (data) => api.post('/api/groups', data),
  getMyGroups: () => api.get('/api/groups/my-groups'),
  getByCode: (codigoUrl) => api.get(`/api/groups/${codigoUrl}`),
  join: (codigoUrl) => api.post(`/api/groups/${codigoUrl}/join`),
  getMembers: (grupoId) => api.get(`/api/groups/${grupoId}/members`),
};

// Gift endpoints
export const giftAPI = {
  create: (data) => api.post('/api/gifts', data),
  getMyGifts: (grupoId) => api.get(`/api/gifts/group/${grupoId}/my-gifts`),
  getWishlist: (grupoId) => api.get(`/api/gifts/group/${grupoId}/wishlist`),
  update: (giftId, data) => api.put(`/api/gifts/${giftId}`, data),
  delete: (giftId) => api.delete(`/api/gifts/${giftId}`),
  markAsBought: (giftId) => api.put(`/api/gifts/${giftId}/buy`),
};

// Notification endpoints
export const notificationAPI = {
  getUnread: () => api.get('/api/notifications/unread'),
  getAll: () => api.get('/api/notifications/all'),
  markAsRead: (notificationIds) => api.put('/api/notifications/read', { notificationIds }),
};

export default api;
