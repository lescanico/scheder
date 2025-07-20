import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    console.log('AuthContext - Token exists:', !!token);
    
    if (token) {
      console.log('AuthContext - Attempting to load user data...');
      authService.getCurrentUser()
        .then(userData => {
          console.log('AuthContext - User data loaded successfully:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch((error) => {
          console.error('AuthContext - Error loading user data:', error);
          console.error('AuthContext - Error response:', error.response);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => {
          console.log('AuthContext - Setting loading to false');
          setLoading(false);
        });
    } else {
      console.log('AuthContext - No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext - Attempting login...');
      const response = await authService.login(email, password);
      const { user: userData, token } = response.data;
      
      console.log('AuthContext - Login successful, user data:', userData);
      
      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('AuthContext - Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { user: newUser, token } = response.data;
      
      localStorage.setItem('token', token);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register
  };

  console.log('AuthContext - Current state:', { user, isAuthenticated, loading });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 