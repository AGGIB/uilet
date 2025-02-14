import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const PricingPage = () => {
  const [apartmentsCount, setApartmentsCount] = useState(5);
  const navigate = useNavigate();
  
  const calculatePrice = (count) => {
    const basePrice = 5000;
    const pricePerApartment = 1000;
    return basePrice + (count > 5 ? (count - 5) * pricePerApartment : 0);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">Гибкое ценообразование</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {apartmentsCount} {apartmentsCount === 1 ? 'квартира' : 
                    apartmentsCount < 5 ? 'квартиры' : 'квартир'}
                </h3>
                <p className="text-gray-600">
                  {calculatePrice(apartmentsCount).toLocaleString()} ₸/месяц
                </p>
              </div>
              <div className="text-sm text-gray-500 mt-4 md:mt-0">
                Первые 5 квартир включены в базовую стоимость
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={apartmentsCount}
                  onChange={(e) => setApartmentsCount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                  ИИ-ассистент с приемом оплат
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                  Уникальный сайт без конкурентов
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                  Интеграция с WhatsApp
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                  Техническая поддержка 24/7
                </li>
              </ul>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-[#2563EB] text-white rounded-xl text-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Выбрать тариф
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 