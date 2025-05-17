import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    // You can return a loading spinner here
    return <div>Loading authentication status...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // Renders the child route's element
};

export default ProtectedRoute;