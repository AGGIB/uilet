import React from 'react';
import { FaEye, FaCalendarCheck, FaWhatsapp } from 'react-icons/fa';

const Analytics = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Аналитика</h2>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaEye className="text-blue-600" />
            <h3 className="font-medium">Просмотры</h3>
          </div>
          <p className="text-2xl font-bold">245</p>
          <p className="text-sm text-gray-600">За последние 30 дней</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaCalendarCheck className="text-green-600" />
            <h3 className="font-medium">Бронирования</h3>
          </div>
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm text-gray-600">За последние 30 дней</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaWhatsapp className="text-green-500" />
            <h3 className="font-medium">WhatsApp</h3>
          </div>
          <p className="text-2xl font-bold">56</p>
          <p className="text-sm text-gray-600">Сообщений отправлено</p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">Популярные объявления</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>ЖК Гранд Астана</span>
            <span className="text-gray-600">89 просмотров</span>
          </div>
          <div className="flex justify-between items-center">
            <span>ЖК Green Park</span>
            <span className="text-gray-600">67 просмотров</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 