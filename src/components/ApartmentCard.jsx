import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const ApartmentCard = ({ apartment }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleClick = () => {
    // Формируем относительный путь от текущего местоположения
    navigate(`apartment/${apartment.id}`);
  };

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={apartment.image}
          alt={apartment.complex}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-2"
        >
          <FaHeart
            className={`${
              isFavorite ? 'text-red-500' : 'text-white'
            } text-xl drop-shadow-lg`}
          />
        </button>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl">{apartment.complex}</h3>
          <div className="flex items-center gap-1">
            <span className="font-medium text-[#2563EB]">{apartment.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-2">{apartment.rooms}х - комнатная</p>
        <p className="font-bold text-xl text-[#2563EB]">{apartment.price.toLocaleString()} ₸</p>
      </div>
    </div>
  );
};

export default ApartmentCard; 