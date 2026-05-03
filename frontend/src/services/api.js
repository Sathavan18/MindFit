import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  register: async (userData) => {
    const response = await api.post('accounts/register/', userData);
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('token/', { username, password });
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('token/refresh/', { refresh: refreshToken });
    return response.data;
  },
};

export default api;