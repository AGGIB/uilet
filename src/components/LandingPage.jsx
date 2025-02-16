import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaWhatsapp, FaChartLine, FaHeart, FaGlobe, FaWallet } from 'react-icons/fa';
import Header from './Header';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setShowConsultation } = useModal();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <div className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              Умный помощник для вашей <span className="text-blue-600">недвижимости</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Автоматизируйте работу с арендаторами и увеличьте прибыль с помощью искусственного интеллекта
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowConsultation(true)}
                className="px-8 py-4 bg-[#2563EB] text-white rounded-xl text-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Получить консультацию
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-8 py-4 border-2 border-[#2563EB] text-[#2563EB] rounded-xl text-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Создать объявление
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unique Features Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Наши преимущества
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <FaRobot className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Умный ИИ-ассистент</h3>
              <p className="text-gray-600">
                Автоматически отвечает на вопросы, ведет переговоры и принимает оплату 24/7
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <FaGlobe className="text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Уникальный сайт</h3>
              <p className="text-gray-600">
                Создаем персональный сайт для ваших объектов без конкурентов на странице
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <FaWallet className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Автоматизация оплат</h3>
              <p className="text-gray-600">
                Встроенная система приема платежей и автоматическое подтверждение бронирований
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-[#2563EB] text-white py-32">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Интересно увидеть как работает ИИ ассистент от Uilet?
            </h2>
            <p className="text-xl mb-8">
              Создайте его прямо сейчас
            </p>
            <button
              onClick={() => navigate(currentUser ? '/dashboard' : '/auth')}
              className="px-8 py-4 bg-black text-white rounded-xl text-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              {currentUser ? 'Перейти в личный кабинет' : 'Создать ассистента'}
            </button>
            <div className="mt-4">
              <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm">
                Создайте ИИ-ассистента от Uilet уже сегодня
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 