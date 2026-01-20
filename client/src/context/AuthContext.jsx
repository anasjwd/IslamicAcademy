
import React, { useState } from 'react';
import authService from '../services/auth';
import { AuthContext } from './AuthContextContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.data);
    return response;
  };

  const signup = async (userData) => {
    const response = await authService.signup(userData);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
