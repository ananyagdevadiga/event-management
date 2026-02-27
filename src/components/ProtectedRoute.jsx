import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to={profile?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
