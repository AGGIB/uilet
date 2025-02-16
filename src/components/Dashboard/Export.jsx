import React, { useState } from 'react';
import { FaWhatsapp, FaDownload } from 'react-icons/fa';
import WhatsAppQRModal from './WhatsAppQRModal';

const Export = () => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Экспорт и интеграции</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WhatsApp интеграция */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <FaWhatsapp className="text-2xl text-green-500" />
            <h3 className="text-lg font-semibold">WhatsApp Business</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Подключите WhatsApp Business для автоматизации общения с клиентами через ИИ-ассистента
          </p>
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <FaWhatsapp />
            <span>Подключить WhatsApp</span>
          </button>
        </div>

        {/* Экспорт данных */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <FaDownload className="text-2xl text-blue-500" />
            <h3 className="text-lg font-semibold">Экспорт данных</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Выгрузите данные о ваших объявлениях и бронированиях в Excel
          </p>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <FaDownload />
            <span>Скачать отчет</span>
          </button>
        </div>
      </div>

      <WhatsAppQRModal 
        isOpen={showWhatsAppModal} 
        onClose={() => setShowWhatsAppModal(false)} 
      />
    </div>
  );
};

export default Export; 