import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = 'any', redirectTo = '/login' }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  // Check role if required
  if (requiredRole !== 'any') {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;

    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on role
      const redirectPath = user.role === 'admin' 
        ? '/admin/dashboard' 
        : user.role === 'staff'
        ? '/admin/dashboard'
        : '/student/dashboard';
      return <Navigate to={redirectPath} />;
    }
  }

  return children;
};

export default ProtectedRoute;