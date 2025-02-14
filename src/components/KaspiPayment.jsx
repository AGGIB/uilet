import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const KaspiPayment = () => {
  const [paymentMethod, setPaymentMethod] = useState('kaspi');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика оплаты
    navigate('/success'); // или куда вам нужно после оплаты
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 p-4 border-b">
        <button 
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <FaArrowLeft className="text-gray-700 text-xl" />
        </button>
      </div>

      <div className="pt-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Способ оплаты</h2>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-4 border rounded-xl mb-4"
            >
              <option value="kaspi">Kaspi.kz</option>
              <option value="card">Банковская карта</option>
              <option value="cash">Наличными</option>
            </select>

            {paymentMethod === 'kaspi' && (
              <input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-4 border rounded-xl"
              />
            )}
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Депозит</span>
              <span className="font-medium">10 000 ₸</span>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-[#FF4E4E] text-white py-4 rounded-xl font-medium"
          >
            {paymentMethod === 'kaspi' ? 'Выставить счет' : 'Оплатить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KaspiPayment; 