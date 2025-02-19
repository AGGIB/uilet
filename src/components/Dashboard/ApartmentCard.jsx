import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';
import ApartmentAvailabilityCard from './ApartmentAvailabilityCard';

const ApartmentCard = ({ apartment, onEdit, onDelete, onToggleActive }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleToggleActive = async () => {
    try {
      const response = await fetch(`/api/apartments/${apartment.id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle apartment status');
      }

      onToggleActive(apartment.id);
    } catch (error) {
      console.error('Error toggling apartment status:', error);
      alert('Ошибка при изменении статуса объявления');
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (!apartment.image_count || apartment.image_count <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % apartment.image_count);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (!apartment.image_count || apartment.image_count <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + apartment.image_count) % apartment.image_count);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${apartment.is_active ? 'opacity-60' : ''}`}>
      <div className="relative aspect-video">
        {apartment.image_count > 0 ? (
          <>
            <img
              src={`/api/apartments/${apartment.id}/images/${currentImageIndex}`}
              alt={apartment.complex}
              className="w-full h-full object-cover"
            />
            {apartment.image_count > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors"
                >
                  <FaChevronRight />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {apartment.image_count}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Нет фото</span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-medium">{apartment.complex}</h3>
            <div className="text-sm text-gray-600 mt-1">
              {apartment.rooms} комн. • {apartment.area} м² • {apartment.floor} этаж
            </div>
          </div>
          <span className="text-xl font-bold text-blue-600">{apartment.price.toLocaleString()} ₸</span>
        </div>

        <div className="text-gray-600">{apartment.address}</div>

        {Object.entries(apartment.amenities).some(([_, value]) => value) && (
          <div>
            <p className="text-sm font-medium mb-2">Удобства:</p>
            <div className="flex flex-wrap gap-2">
              {apartment.amenities.wifi && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">WiFi</span>
              )}
              {apartment.amenities.parking && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Парковка</span>
              )}
              {apartment.amenities.ac && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Кондиционер</span>
              )}
              {apartment.amenities.washer && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Стиральная машина</span>
              )}
              {apartment.amenities.kitchen && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Кухня</span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onEdit(apartment)}
            className="flex-1 px-4 py-2.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
          >
            <FaEdit />
            Редактировать
          </button>
          <button
            onClick={() => onDelete(apartment.id)}
            className="flex-1 px-4 py-2.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <FaTrash />
            Удалить
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-b">
          <span className="text-sm font-medium">Статус объявления</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!apartment.is_active}
              onChange={handleToggleActive}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm text-gray-600">
              {!apartment.is_active ? 'Активно' : 'Неактивно'}
            </span>
          </label>
        </div>

        <div>
          <ApartmentAvailabilityCard apartment={apartment} />
        </div>
      </div>
    </div>
  );
};

export default ApartmentCard; 