import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Profile = ({ siteUrl, onSiteUrlChange }) => {
  const { currentUser, updatePassword, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('light');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans = [
    {
      id: 'light',
      name: 'Лайт',
      price: '9900',
      features: [
        'До 5 объявлений',
        'Базовый ИИ-ассистент',
        'Поддомен на uilet.kz',
        'Базовый календарь бронирований'
      ]
    },
    {
      id: 'business',
      name: 'Бизнес',
      isPopular: true,
      price: '19900',
      features: [
        'Все функции тарифа Лайт',
        'Расширенный ИИ-ассистент',
        'Собственный домен',
        'Синхронизация с Google Calendar',
        'Автоматическая блокировка дат'
      ]
    },
    {
      id: 'pro',
      name: 'Про',
      price: '29900',
      features: [
        'Все функции тарифа Бизнес',
        'Приоритетная поддержка 24/7',
        'Мультикалендарь для всех площадок',
        'API для интеграций с внешними системами',
        'Синхронизация с Booking.com и Airbnb'
      ]
    }
  ];

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updatePassword(oldPassword, newPassword);
      setSuccess('Пароль успешно изменен');
      setIsEditingPassword(false);
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      setError('Ошибка при выходе');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Профиль</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Выйти
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Информация о пользователе */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Основная информация</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Email: </span>
              <span className="font-medium">{currentUser?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-600">Пароль: </span>
                <span className="font-medium">••••••••</span>
              </div>
              <button
                onClick={() => setIsEditingPassword(true)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Изменить
              </button>
            </div>
          </div>
        </div>

        {/* Форма изменения пароля */}
        {isEditingPassword && (
          <div className="border rounded-lg p-4">
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-500 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 text-green-500 rounded-lg">
                  {success}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Текущий пароль
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPassword(false);
                    setOldPassword('');
                    setNewPassword('');
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Тарифы */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-4">Текущий тариф</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer relative ${
                  currentPlan === plan.id ? 'border-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => setCurrentPlan(plan.id)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full inline-flex items-center gap-1">
                      <span role="img" aria-label="fire">🔥</span>
                      Покупают чаще
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{plan.name}</h4>
                  <span className="text-lg font-bold">{plan.price} ₸</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {currentPlan === plan.id && (
                  <div className="mt-4 text-sm text-blue-600">
                    Текущий тариф
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={() => {/* Логика обновления тарифа */}}
            >
              Обновить тариф
            </button>
          </div>
        </div>

        {/* Домен */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Настройки домена</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Ваш домен на Uilet.kz
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={siteUrl.split('.')[0]}
                  onChange={(e) => onSiteUrlChange(`${e.target.value}.uilet.kz`)}
                  className="flex-1 p-2 border rounded-lg"
                />
                <span className="p-2 text-gray-500">.uilet.kz</span>
              </div>
            </div>
            {currentPlan === 'pro' && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Собственный домен
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="example.com"
                />
              </div>
            )}
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
          Сохранить изменения
        </button>
      </div>
    </div>
  );
};

export default Profile; 