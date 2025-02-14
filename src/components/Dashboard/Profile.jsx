import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Profile = ({ siteUrl, onSiteUrlChange }) => {
  const { currentUser, updatePassword, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans = [
    {
      id: 'basic',
      name: 'Базовый',
      price: '5000',
      features: [
        'До 5 объявлений',
        'Базовый ИИ-ассистент',
        'Поддомен на uilet.kz'
      ]
    },
    {
      id: 'pro',
      name: 'Профессиональный',
      price: '15000',
      features: [
        'Неограниченное количество объявлений',
        'Расширенный ИИ-ассистент',
        'Собственный домен',
        'Продвинутая аналитика'
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

        {/* Тариф */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Тарифный план</h3>
          <div className="grid grid-cols-2 gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer ${
                  currentPlan === plan.id ? 'border-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => setCurrentPlan(plan.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{plan.name}</h4>
                  <span className="text-lg font-bold">{plan.price} ₸</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
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