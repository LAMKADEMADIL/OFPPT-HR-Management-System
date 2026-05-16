import api from './api';

/**
 * authService — handles login, register, logout, and local session.
 *
 * Fixes applied:
 * 1. Removed hardcoded absolute URLs (http://localhost:8000/...) — now uses
 *    relative paths so API_BASE_URL from constants is respected.
 * 2. The backend AuthController returns 'access_token', not 'token' —
 *    both localStorage key and extraction are now consistent.
 */
const authService = {
  async login(credentials) {
    // Response contains { success: true, data: { user, access_token }, message: "..." }
    const response = await api.post('/auth/login', credentials);
    const result = response.data.data || response.data; // Handles both wrapped and unwrapped

    if (result && result.access_token) {
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    const result = response.data.data || response.data;

    if (result && result.access_token) {
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if server logout fails, clear local state
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export default authService;
