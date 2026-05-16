/**
 * axiosInstance.js
 * Instance Axios préconfigurée pour l'API Laravel.
 * Gère automatiquement le token JWT et les erreurs 401.
 */
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

// ── Request interceptor — attache le token ─────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — gère les 401 ───────────────────────
axiosInstance.interceptors.response.use(
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

export default axiosInstance;
