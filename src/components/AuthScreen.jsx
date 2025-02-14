import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaRegEyeSlash, FaRegEye, FaArrowLeft } from 'react-icons/fa';
import Logo from '../assets/logo';

const AuthScreen = ({ isRegister = false }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl p-8 shadow-lg relative">
        <button
          onClick={handleBack}
          className="absolute left-8 top-8 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft />
          <span>Назад</span>
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isRegister ? 'Создать аккаунт' : 'Войдите'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegister ? (
              <>
                Уже есть аккаунт?{' '}
                <Link to="/auth" className="text-[#2563EB] hover:text-blue-500">
                  Войти
                </Link>
              </>
            ) : (
              <>
                Нет аккаунта?{' '}
                <Link to="/register" className="text-[#2563EB] hover:text-blue-500">
                  Создать
                </Link>
              </>
            )}
          </p>
        </div>

        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB]">
          <FaGoogle className="text-[#DB4437]" />
          <span>Войти через Google</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">или</span>
          </div>
        </div>

        <form className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Почта
            </label>
            <div className="mt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                placeholder="Введите вашу почту"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB]"
                placeholder="Введите ваш пароль"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
          </div>

          {!isRegister && (
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[#2563EB] hover:text-blue-500"
              >
                Забыли пароль?
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#2563EB] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB]"
          >
            {isRegister ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen; 