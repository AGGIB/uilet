import React, { useState } from 'react';
import { FaWhatsapp, FaQrcode } from 'react-icons/fa';

const Export = () => {
  const [showQRCode, setShowQRCode] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Экспорт ассистента</h2>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <FaWhatsapp className="text-green-500 text-xl" />
              <div>
                <h3 className="font-medium">WhatsApp</h3>
                <p className="text-sm text-gray-600">Подключите ассистента к WhatsApp</p>
              </div>
            </div>
            <button
              onClick={() => setShowQRCode(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Подключить
            </button>
          </div>
        </div>
      </div>

      {/* QR код модальное окно */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Подключение WhatsApp</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaQrcode className="text-6xl" />
              </div>
              <p className="text-center text-gray-600">
                Отсканируйте QR-код в приложении WhatsApp для подключения ассистента
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

export default Export; 