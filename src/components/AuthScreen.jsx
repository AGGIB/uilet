import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegEyeSlash, FaRegEye, FaArrowLeft } from 'react-icons/fa';
import Logo from '../assets/logo';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen = ({ isRegister = false }) => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await signup(formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl p-8 shadow-lg relative">
        <button
          onClick={() => navigate('/')}
          className="absolute left-8 top-8 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft />
          <span>Назад</span>
        </button>
        
        <div className="text-center">
          <Logo />
          <h2 className="mt-6 text-3xl font-bold">
            {isRegister ? 'Создать аккаунт' : 'Войти'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <Link 
              to={isRegister ? "/auth" : "/register"} 
              className="text-blue-600 hover:text-blue-500"
            >
              {isRegister ? 'Войти' : 'Создать'}
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
              </button>
            </div>
          </div>

          {!isRegister && (
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                Забыли пароль?
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : (isRegister ? 'Создать аккаунт' : 'Войти')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen; 