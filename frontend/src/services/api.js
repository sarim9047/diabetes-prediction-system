import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dpa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        localStorage.removeItem('dpa_token');
        localStorage.removeItem('dpa_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const predictionApi = {
  predict: (data) => api.post('/predict', data),
  getPredictions: (params) => api.get('/predictions', { params }),
  getPredictionById: (id) => api.get(`/predictions/${id}`),
  deletePrediction: (id) => api.delete(`/predictions/${id}`),
};

export const reportApi = {
  downloadPdf: (id) =>
    api.get(`/reports/${id}/pdf`, {
      responseType: 'blob',
    }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getHistory: () => api.get('/dashboard/history'),
};

export const mlApi = {
  getInfo: () => api.get('/model/info'),
  getMetrics: () => api.get('/model/metrics'),
  getVisualizationUrl: (chartName) => `${API_BASE_URL}/model/visualizations/${chartName.endsWith('.png') ? chartName : `${chartName}.png`}`,
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getPredictions: (params) => api.get('/admin/predictions', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
