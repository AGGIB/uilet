import React, { createContext, useContext, useState } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.signIn({ email, password });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        const profile = await api.getProfile();
        setCurrentUser(profile);
      } else {
        throw new Error('Token not received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.signUp({ email, password });
      localStorage.setItem('token', response.token);
      const profile = await api.getProfile();
      setCurrentUser(profile);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Проверяем токен и получаем данные пользователя при загрузке
  React.useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await api.getProfile();
          setCurrentUser(profile);
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    validateAuth();
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 