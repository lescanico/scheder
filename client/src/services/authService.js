import { api } from './requestService';

export const authService = {
  // Login user
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  // Logout user
  async logout() {
    const response = await api.post('/auth/logout');
    return response;
  },

  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  // Get all users (admin only)
  async getUsers() {
    const response = await api.get('/auth/users');
    return response;
  },

  // Create new user (admin only)
  async createUser(userData) {
    const response = await api.post('/auth/users', userData);
    return response;
  },

  // Update user (admin only)
  async updateUser(userId, userData) {
    const response = await api.put(`/auth/users/${userId}`, userData);
    return response;
  },

  // Delete user (admin only)
  async deleteUser(userId) {
    const response = await api.delete(`/auth/users/${userId}`);
    return response;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken() {
    return localStorage.getItem('token');
  },

  // Clear token
  clearToken() {
    localStorage.removeItem('token');
  }
}; 