const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3306';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...options.headers,
      },
      credentials: 'include', // Important for cookies (refresh token)
    };

    // Only add Content-Type if there's a body
    if (options.body) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Add access token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // If unauthorized and not already retrying, try to refresh token
      if (response.status === 401 && !options._retry) {
        try {
          // Try to refresh the token
          const refreshResponse = await fetch(`${this.baseURL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success && refreshData.accessToken) {
              localStorage.setItem('accessToken', refreshData.accessToken);
              
              // Retry the original request with new token
              config.headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
              options._retry = true;
              return this.request(endpoint, options);
            }
          }
        } catch (refreshError) {
          // If refresh fails, logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.reload();
        }
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadFiles(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        ...options.headers,
      },
    };

    // Don't set Content-Type for FormData, browser will set it with boundary
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

export default new ApiService();
