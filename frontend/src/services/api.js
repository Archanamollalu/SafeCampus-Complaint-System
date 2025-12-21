import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
API.interceptors.request.use(
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

// Response interceptor for handling errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getProfile: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// Complaint API
export const complaintAPI = {
  getAll: () => API.get('/complaints'),
  getById: (id) => API.get(`/complaints/${id}`),
  // Accept optional Axios config (e.g., for multipart/form-data)
  create: (data, config) => API.post('/complaints', data, config),
  update: (id, data) => API.put(`/complaints/${id}`, data),
  delete: (id) => API.delete(`/complaints/${id}`),
  getMyComplaints: () => API.get('/complaints/my'),
  updateStatus: (id, status) => API.patch(`/complaints/${id}/status`, { status }),
  addResponse: (id, response) => API.post(`/complaints/${id}/response`, { response }),
  getStats: () => API.get('/complaints/stats'),
  getByStatus: (status) => API.get(`/complaints/status/${status}`),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => API.get('/admin/users'),
  getUser: (id) => API.get(`/admin/users/${id}`),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getAdminStats: () => API.get('/admin/stats'),
  getComplaintAnalytics: () => API.get('/admin/analytics'),
};