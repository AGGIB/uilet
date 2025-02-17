import React, { createContext, useContext, useState } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.signIn({ email, password });
      localStorage.setItem('token', response.token);
      setCurrentUser({ email });
    } catch (error) {
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
      setCurrentUser({ email });
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

  // Проверяем localStorage при загрузке
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Добавить проверку токена
      setCurrentUser({ email: 'user@example.com' }); // Временное решение
    }
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
      {children}
    </AuthContext.Provider>
  );
}; 