import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

    const checkRole = (requiredRole) => {
      if (!user) return false;
      if (requiredRole === 'any') return true;
      if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
      }
      return user.role === requiredRole;
    };
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Try to get user data
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      enqueueSnackbar('Login successful!', { variant: 'success' });
      return { success: true, role: user.role };
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Login failed', { variant: 'error' });
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post('/api/auth/register', userData);
      enqueueSnackbar('Registration successful! Please login.', { variant: 'success' });
      return { success: true };
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Registration failed', { variant: 'error' });
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    enqueueSnackbar('Logged out successfully', { variant: 'info' });
  };

  const updateProfile = async (data) => {
    try {
      const response = await axios.put('/api/auth/profile', data);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      return { success: true };
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Update failed', { variant: 'error' });
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user,
      checkRole,
      hasRole: (role) => {
        if (!user) return false;
        return user.role === role;
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};