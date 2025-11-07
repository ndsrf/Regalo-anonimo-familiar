import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

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
      // Let AuthContext handle logout and redirect
      // Don't use hard redirect here to avoid breaking React state
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
  googleLogin: (returnTo) => {
    let url = API_URL ? `${API_URL}/auth/google` : '/auth/google';
    if (returnTo) {
      url += `?returnTo=${encodeURIComponent(returnTo)}`;
    }
    window.location.href = url;
  },
  metaLogin: (returnTo) => {
    let url = API_URL ? `${API_URL}/auth/meta` : '/auth/meta';
    if (returnTo) {
      url += `?returnTo=${encodeURIComponent(returnTo)}`;
    }
    window.location.href = url;
  },
};

// Group endpoints
export const groupAPI = {
  create: (data) => api.post('/api/groups', data),
  getMyGroups: () => api.get('/api/groups/my-groups'),
  getArchivedGroups: () => api.get('/api/groups/archived-groups'),
  getByCode: (codigoUrl) => api.get(`/api/groups/${codigoUrl}`),
  join: (codigoUrl) => api.post(`/api/groups/${codigoUrl}/join`),
  getMembers: (grupoId) => api.get(`/api/groups/${grupoId}/members`),
  update: (grupoId, data) => api.put(`/api/groups/${grupoId}/update`, data),
  archive: (grupoId) => api.put(`/api/groups/${grupoId}/archive`),
  // Secret Santa endpoints
  createPairings: (grupoId) => api.post(`/api/groups/${grupoId}/secret-santa/create-pairings`),
  getMyAssignment: (grupoId) => api.get(`/api/groups/${grupoId}/secret-santa/my-assignment`),
};

// Gift endpoints
export const giftAPI = {
  create: (data) => api.post('/api/gifts', data),
  getMyGifts: (grupoId) => api.get(`/api/gifts/group/${grupoId}/my-gifts`),
  getWishlist: (grupoId) => api.get(`/api/gifts/group/${grupoId}/wishlist`),
  update: (giftId, data) => api.put(`/api/gifts/${giftId}`, data),
  delete: (giftId) => api.delete(`/api/gifts/${giftId}`),
  markAsBought: (giftId) => api.put(`/api/gifts/${giftId}/buy`),
  unmarkAsBought: (giftId) => api.put(`/api/gifts/${giftId}/unbuy`),
};

// Notification endpoints
export const notificationAPI = {
  getUnread: () => api.get('/api/notifications/unread'),
  getAll: () => api.get('/api/notifications/all'),
  markAsRead: (notificationIds) => api.put('/api/notifications/read', { notificationIds }),
};

export default api;
