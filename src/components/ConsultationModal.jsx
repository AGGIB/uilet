import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ConsultationModal = ({ onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика отправки заявки
    console.log({ name, phone });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ marginTop: 0 }}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Получить консультацию</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Ваше имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl"
              placeholder="Введите ваше имя"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Номер телефона
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl"
              placeholder="+7 (___) ___-__-__"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-medium hover:bg-opacity-90 transition-colors"
          >
            Отправить заявку
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationModal; 