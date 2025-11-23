import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
  getGoogleAuthUrl() {
    return `${API_URL}/auth/google`;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
