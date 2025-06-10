import api from '../config/api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    // Make sure the user object has the expected properties
    if (user && user.uid && user.email) {
      return {
        ...user,
        // Add this to maintain backward compatibility with getIdToken()
        getIdToken: async () => {
          const token = localStorage.getItem('token');
          if (!token) return null;
          return token;
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};
