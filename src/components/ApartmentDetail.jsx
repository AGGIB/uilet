import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaStar, FaArrowLeft } from 'react-icons/fa';
import { apartments } from '../data/apartments';
import WhatsAppModal from './WhatsAppModal';

const ApartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  
  // Находим квартиру по id из URL
  const apartment = apartments.find(apt => apt.id === parseInt(id));

  if (!apartment) return <div>Квартира не найдена</div>;

  const handleBooking = () => {
    setShowWhatsApp(true);
  };

  const handleWhatsAppSubmit = (phone) => {
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 p-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <FaArrowLeft className="text-gray-700 text-xl" />
        </button>
      </div>

      {/* Main Content */}
      <div className="pt-16">
        <div className="relative">
          <img
            src={apartment.image}
            alt={apartment.complex}
            className="w-full h-[300px] object-cover"
          />
          <button className="absolute top-3 right-3 p-2">
            <FaHeart className="text-white text-xl drop-shadow-lg" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">{apartment.complex}</h1>
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400" />
              <span className="font-medium">{apartment.rating}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{apartment.rooms}х - комнатная</p>

          <div className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <div>
                <p className="text-gray-600">Дата въезда</p>
                <p>25/12/2024</p>
              </div>
              <div>
                <p className="text-gray-600">Дата выезда</p>
                <p>30/12/2024</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-gray-600">Количество ночей</p>
              <p>2 ночи</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span>{apartment.price.toLocaleString()} ₸ x 5 суток</span>
              <span>{(apartment.price * 5).toLocaleString()} ₸</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Сумма депозита</span>
              <span>10 000 ₸</span>
            </div>
          </div>

          <button 
            onClick={handleBooking}
            className="w-full bg-[#2F4F4F] text-white py-3 rounded-lg mt-6"
          >
            Забронировать
          </button>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsApp && (
        <WhatsAppModal 
          onSubmit={handleWhatsAppSubmit}
          onClose={() => setShowWhatsApp(false)}
        />
      )}
    </div>
  );
};

export default ApartmentDetail; 