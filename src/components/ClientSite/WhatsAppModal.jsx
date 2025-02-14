import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const WhatsAppModal = ({ onSubmit, onClose }) => {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(phone);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Введите номер WhatsApp</h2>
          <button onClick={onClose} className="p-2">
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 text-lg focus:outline-none focus:border-gray-300"
              required
            />
          </div>
          
          <p className="text-gray-500 text-sm mb-6">
            Мы отправим информацию о бронировании в WhatsApp
          </p>

          <button 
            type="submit"
            className="w-full bg-[#2F4F4F] text-white py-4 rounded-xl font-medium"
          >
            Продолжить
          </button>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppModal; 