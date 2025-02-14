import React, { useState } from 'react';

const AISettings = () => {
  const [settings, setSettings] = useState({
    agentName: '',
    companyInfo: '',
    messages: {
      welcome: '',
      booking: '',
      checkin: ''
    }
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMessageChange = (type, value) => {
    setSettings(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [type]: value
      }
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Настройка ИИ-ассистента</h2>
      
      <div className="space-y-6">
        {/* Основная информация об ассистенте */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Информация об ассистенте</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Имя ассистента
              </label>
              <input
                type="text"
                value={settings.agentName}
                onChange={(e) => handleChange('agentName', e.target.value)}
                placeholder="Например: Анна"
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Информация о компании
              </label>
              <textarea
                value={settings.companyInfo}
                onChange={(e) => handleChange('companyInfo', e.target.value)}
                placeholder="Расскажите о вашей компании..."
                rows="3"
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Шаблоны сообщений */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Шаблоны сообщений</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Приветственное сообщение
              </label>
              <textarea
                value={settings.messages.welcome}
                onChange={(e) => handleMessageChange('welcome', e.target.value)}
                rows="3"
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Подтверждение бронирования
              </label>
              <textarea
                value={settings.messages.booking}
                onChange={(e) => handleMessageChange('booking', e.target.value)}
                rows="3"
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Инструкции по заселению
              </label>
              <textarea
                value={settings.messages.checkin}
                onChange={(e) => handleMessageChange('checkin', e.target.value)}
                rows="3"
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
          Сохранить настройки
        </button>
      </div>
    </div>
  );
};

export default AISettings; 