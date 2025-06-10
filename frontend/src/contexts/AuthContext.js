import React, { createContext, useContext, useEffect, useState } from 'react';
import { login, logout, getCurrentUser, register } from '../services/authService';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setUserData(user);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await login(email, password);
      setCurrentUser(response.user);
      setUserData(response.user);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setUserData(null);
  };

  const handleRegister = async (userData) => {
    try {
      const response = await register(userData);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
