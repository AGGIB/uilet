import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const PricingPage = () => {
  const [apartmentsCount, setApartmentsCount] = useState(5);
  const [period, setPeriod] = useState('month');
  const navigate = useNavigate();

  const calculatePrice = (plan) => {
    const basePrices = {
      light: 9900,
      business: 19900,
      pro: 29900
    };

    // Добавляем стоимость за каждую квартиру свыше 5
    let price = basePrices[plan];
    if (apartmentsCount > 5) {
      const extraApartments = apartmentsCount - 5;
      price += extraApartments * 1000;
    }

    if (period === 'quarter') {
      // 10% скидка при оплате за 3 месяца
      price = price * 3 * 0.9;
    }

    return price;
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">
            {apartmentsCount} {apartmentsCount === 1 ? 'квартира' : apartmentsCount < 5 ? 'квартиры' : 'квартир'}
          </h1>

          {/* Слайдер квартир */}
          <div className="max-w-3xl mx-auto mb-8">
            <input
              type="range"
              min="1"
              max="50"
              value={apartmentsCount}
              onChange={(e) => setApartmentsCount(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>1</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
              <span>50</span>
            </div>
          </div>

          {/* Переключатель периода */}
          <div className="flex justify-center gap-2 mb-12">
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-full ${
                period === 'month' 
                  ? 'bg-gray-200' 
                  : 'bg-transparent hover:bg-gray-100'
              }`}
            >
              1 месяц
            </button>
            <button
              onClick={() => setPeriod('quarter')}
              className={`px-4 py-2 rounded-full ${
                period === 'quarter' 
                  ? 'bg-[#10B981] text-white' 
                  : 'bg-transparent hover:bg-gray-100'
              }`}
            >
              3 месяца
              <span className="ml-2 text-sm bg-black bg-opacity-20 px-2 py-1 rounded-full">
                -10%
              </span>
            </button>
          </div>

          {/* Тарифы */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Лайт */}
            <div className="border rounded-xl p-6 bg-white">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">Лайт</h3>
                <p className="text-3xl font-bold mb-1">
                  {Math.round(calculatePrice('light')).toLocaleString()}₸
                  <span className="text-base font-normal text-gray-500">
                    /{period === 'month' ? 'месяц' : '3 месяца'}
                  </span>
                </p>
                <p className="text-gray-600">
                  Начальный тариф для небольшого количества квартир
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  До 5 объявлений
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Базовый ИИ-ассистент
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Поддомен на uilet.kz
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Базовый календарь бронирований
                </li>
              </ul>
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3 px-4 border border-[#2563EB] text-[#2563EB] rounded-xl hover:bg-blue-50"
              >
                Купить
              </button>
            </div>

            {/* Бизнес */}
            <div className="border-2 border-[#2563EB] rounded-xl p-6 bg-white relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                  🔥 Покупают чаще
                </span>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">Бизнес</h3>
                <p className="text-3xl font-bold mb-1">
                  {Math.round(calculatePrice('business')).toLocaleString()}₸
                  <span className="text-base font-normal text-gray-500">
                    /{period === 'month' ? 'месяц' : '3 месяца'}
                  </span>
                </p>
                <p className="text-gray-600">
                  Оптимальный тариф для активных арендодателей
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Все функции тарифа Лайт
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Расширенный ИИ-ассистент
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Собственный домен
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Синхронизация с Google Calendar
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Автоматическая блокировка дат
                </li>
              </ul>
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3 px-4 bg-[#2563EB] text-white rounded-xl hover:bg-blue-600"
              >
                Купить
              </button>
            </div>

            {/* Про */}
            <div className="border rounded-xl p-6 bg-white">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">Про</h3>
                <p className="text-3xl font-bold mb-1">
                  {Math.round(calculatePrice('pro')).toLocaleString()}₸
                  <span className="text-base font-normal text-gray-500">
                    /{period === 'month' ? 'месяц' : '3 месяца'}
                  </span>
                </p>
                <p className="text-gray-600">
                  Максимальные возможности для профессионалов
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Все функции тарифа Бизнес
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Приоритетная поддержка 24/7
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Мультикалендарь для всех площадок
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  API для интеграций с внешними системами
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">✓</span>
                  Синхронизация с Booking.com и Airbnb
                </li>
              </ul>
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3 px-4 border border-[#2563EB] text-[#2563EB] rounded-xl hover:bg-blue-50"
              >
                Приобрести
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 