import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeart, FaShare, FaWhatsapp } from 'react-icons/fa';
import { apartments } from '../../data/apartments';

const ApartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  // В реальном приложении здесь будет запрос к API
  const apartment = apartments.find(apt => apt.id === parseInt(id));

  if (!apartment) {
    return <div>Квартира не найдена</div>;
  }

  const handleBooking = () => {
    if (!whatsappNumber) {
      setShowWhatsApp(true);
      return;
    }
    navigate('../payment');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft />
              <span>Назад</span>
            </button>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <FaShare className="text-[#2563EB]" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <FaHeart className="text-[#2563EB]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16">
        <div className="relative h-[400px]">
          <img
            src={apartment.image}
            alt={apartment.complex}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{apartment.complex}</h1>
                <p className="text-gray-600">{apartment.address}</p>
              </div>
              <div className="text-[#2563EB] font-bold text-lg">
                {apartment.rating}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="text-gray-500 text-sm">Комнат</div>
                <div className="font-medium">{apartment.rooms}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="text-gray-500 text-sm">Площадь</div>
                <div className="font-medium">{apartment.area} м²</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="text-gray-500 text-sm">Этаж</div>
                <div className="font-medium">{apartment.floor}</div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="font-bold mb-2">Описание</h2>
              <p className="text-gray-600">{apartment.description}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-500">Стоимость</div>
                  <div className="text-2xl font-bold text-[#2563EB]">
                    {apartment.price.toLocaleString()} ₸/мес
                  </div>
                </div>
                <button
                  onClick={handleBooking}
                  className="px-8 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-opacity-90 transition-colors"
                >
                  Забронировать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Введите номер WhatsApp</h3>
              <button 
                onClick={() => setShowWhatsApp(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <FaWhatsapp className="text-green-500 text-xl" />
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="bg-transparent w-full outline-none"
                />
              </div>
              <button
                onClick={() => {
                  setShowWhatsApp(false);
                  navigate('../payment');
                }}
                className="w-full py-3 bg-[#2563EB] text-white rounded-xl hover:bg-opacity-90 transition-colors"
              >
                Продолжить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentDetail; 