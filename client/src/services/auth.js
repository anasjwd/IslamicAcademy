import api from './api';

class AuthService {
  async signup(userData) {
    const response = await api.post('/api/auth/signup', userData);
    return response;
  }

  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    
    if (response.success && response.accessToken) {
      // Store access token
      localStorage.setItem('accessToken', response.accessToken);
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response;
  }

  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken() {
    try {
      const response = await api.post('/api/auth/refresh');
      if (response.success && response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        return response.accessToken;
      }
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw error;
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export default new AuthService();
