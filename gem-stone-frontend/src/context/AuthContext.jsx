import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return response;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return response;
  };

  const logout = () => {
  localStorage.removeItem('token');
  setToken(null);
  setUser(null);
};

// NEW: Role helper methods
const isSeller = () => {
  return !!user;
};

const isBuyer = () => {
  return user?.role === 'buyer' || user?.role === 'user' || user?.role === 'seller' || user?.role === 'admin';
};

const isNGJA = () => {
  return user?.role === 'ngja_officer' || user?.role === 'admin';
};

const isAdmin = () => {
  return user?.role === 'admin';
};

const value = {
  user,
  loading,
  login,
  register,
  logout,
  isAuthenticated: !!user,
  isSeller,
  isBuyer,
  isNGJA,
  isAdmin,
};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
