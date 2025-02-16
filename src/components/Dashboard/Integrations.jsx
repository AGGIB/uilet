import React, { useState } from 'react';
import { FaAirbnb, FaQrcode, FaHotel } from 'react-icons/fa';

const Integrations = () => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState(null);

  const integrations = [
    {
      id: 'airbnb',
      name: 'Airbnb',
      icon: FaAirbnb,
      color: 'text-[#FF5A5F]',
      bgColor: 'bg-[#FF5A5F]',
      description: 'Синхронизация календаря и бронирований с Airbnb'
    },
    {
      id: 'booking',
      name: 'Booking.com',
      icon: FaHotel,
      color: 'text-[#003580]',
      bgColor: 'bg-[#003580]',
      description: 'Синхронизация календаря и бронирований с Booking.com'
    }
  ];

  const handleConnect = (integration) => {
    setCurrentIntegration(integration);
    setShowQRCode(true);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Интеграции</h2>
      
      <div className="space-y-4">
        {integrations.map(integration => (
          <div key={integration.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <integration.icon className={`text-3xl ${integration.color}`} />
                <div>
                  <h3 className="font-medium">{integration.name}</h3>
                  <p className="text-sm text-gray-600">{integration.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleConnect(integration)}
                className={`px-4 py-2 text-white rounded-lg ${integration.bgColor} hover:opacity-90`}
              >
                Подключить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR код модальное окно */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Подключение {currentIntegration.name}
              </h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaQrcode className="text-6xl" />
              </div>
              <p className="text-center text-gray-600">
                Отсканируйте QR-код в приложении {currentIntegration.name} для подключения интеграции
              </p>
              <button
                onClick={() => setShowQRCode(false)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations; 