import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const KitchenStaffRoute = () => {
  const { userData, loading } = useAuth();

  if (loading) {
    return <p>Loading authentication details...</p>;
  }

  const allowedRoles = ['admin', 'kitchenStaff'];

  if (userData && allowedRoles.includes(userData.role)) {
    return <Outlet />; // Render the nested route if role is allowed
  } else {
    // Redirect to home page with an error message if not authorized
    return <Navigate to="/" replace state={{ error: 'You do not have permission to access this page.' }} />;
  }
};

export default KitchenStaffRoute;
