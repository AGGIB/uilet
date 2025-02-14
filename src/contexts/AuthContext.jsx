import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Простая эмуляция регистрации
  const signup = async (email, password) => {
    setLoading(true);
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        email,
        uid: Date.now().toString(),
        siteUrl: `user-${Date.now()}.uilet.kz`
      };
      
      // Сохраняем в localStorage
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
    } catch (error) {
      throw new Error('Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  // Простая эмуляция входа
  const login = async (email, password) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // В реальном приложении здесь была бы проверка credentials
      const user = {
        email,
        uid: Date.now().toString(),
        siteUrl: `user-${Date.now()}.uilet.kz`
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
    } catch (error) {
      throw new Error('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  // Эмуляция входа через Google
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        email: 'user@gmail.com',
        uid: Date.now().toString(),
        siteUrl: `user-${Date.now()}.uilet.kz`
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
    } catch (error) {
      throw new Error('Ошибка входа через Google');
    } finally {
      setLoading(false);
    }
  };

  // Выход
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Проверяем localStorage при загрузке
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Добавим функцию изменения пароля
  const updatePassword = async (oldPassword, newPassword) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const updatedUser = {
          ...user,
          password: newPassword // В реальном приложении пароль не хранится в открытом виде
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      throw new Error('Ошибка при изменении пароля');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    signInWithGoogle,
    logout,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 