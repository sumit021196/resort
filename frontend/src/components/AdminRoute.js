import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = () => {
  const { userData, loading } = useAuth();

  if (loading) {
    // While checking auth state and user data, show a loading indicator
    return <p>Loading authentication details...</p>;
  }

  // If not loading, check if user data exists and if the role is 'admin'
  if (userData && userData.role === 'admin') {
    return <Outlet />; // Render the nested route (e.g., UserManagementPage)
  } else {
    // If not an admin, redirect to the home page
    // You can pass state to the home page to show a message if you want
    return <Navigate to="/" replace state={{ error: 'You do not have permission to access this page.' }} />;
  }
};

export default AdminRoute;
