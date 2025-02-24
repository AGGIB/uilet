import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { api } from '../../api/api';
import ApartmentAvailabilityCard from './ApartmentAvailabilityCard';
import ConfirmModal from './ConfirmModal';

const ApartmentCard = ({ apartment, onEdit, onDelete, onToggleActive }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const imageCache = useRef(new Map());
  const preloadQueue = useRef([]);
  const isLoadingRef = useRef(false);
  const supportsWebp = useRef(null);

  // Проверяем поддержку WebP
  useEffect(() => {
    if (supportsWebp.current === null) {
      const img = new Image();
      img.onload = () => {
        supportsWebp.current = true;
      };
      img.onerror = () => {
        supportsWebp.current = false;
      };
      img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    }
  }, []);

  const getImageUrl = useCallback((index) => {
    const baseUrl = api.getImageUrl(apartment.id, index);
    const timestamp = Date.now();
    return `${baseUrl}?t=${timestamp}${supportsWebp.current ? '&format=webp' : ''}`;
  }, [apartment.id]);

  const preloadImage = useCallback((index) => {
    if (index < 0 || index >= apartment.image_count || imageCache.current.has(index)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        imageCache.current.set(index, true);
        resolve();
      };
      img.onerror = resolve; // Продолжаем даже при ошибке
      img.src = getImageUrl(index);
      // Используем низкий приоритет для предзагрузки
      img.fetchPriority = "low";
      // Используем декодирование асинхронно
      if ('decode' in img) {
        img.decode().catch(() => {});
      }
    });
  }, [apartment.image_count, getImageUrl]);

  const processPreloadQueue = useCallback(async () => {
    if (isLoadingRef.current || preloadQueue.current.length === 0) return;
    
    isLoadingRef.current = true;
    const index = preloadQueue.current.shift();
    
    try {
      await preloadImage(index);
    } finally {
      isLoadingRef.current = false;
      requestIdleCallback(() => processPreloadQueue());
    }
  }, [preloadImage]);

  const addToPreloadQueue = useCallback((index) => {
    if (!preloadQueue.current.includes(index)) {
      preloadQueue.current.push(index);
      requestIdleCallback(() => processPreloadQueue());
    }
  }, [processPreloadQueue]);

  useEffect(() => {
    if (!apartment.image_count) return;

    // Предзагружаем текущее изображение
    preloadImage(currentImageIndex);

    // Добавляем соседние изображения в очередь предзагрузки
    const nextIndex = (currentImageIndex + 1) % apartment.image_count;
    const prevIndex = (currentImageIndex - 1 + apartment.image_count) % apartment.image_count;
    
    addToPreloadQueue(nextIndex);
    addToPreloadQueue(prevIndex);

    // Очищаем кэш при размонтировании
    return () => {
      imageCache.current.clear();
      preloadQueue.current = [];
    };
  }, [currentImageIndex, apartment.image_count, preloadImage, addToPreloadQueue]);

  const handleImageChange = useCallback(async (newIndex) => {
    setIsImageLoading(true);
    await preloadImage(newIndex);
    setCurrentImageIndex(newIndex);
    setIsImageLoading(false);
  }, [preloadImage]);

  const handleToggleActive = async () => {
    try {
      await api.toggleApartmentStatus(apartment.id);
      onToggleActive(apartment.id);
      toast.success(
        apartment.is_active 
          ? 'Объявление деактивировано' 
          : 'Объявление активировано'
      );
    } catch (error) {
      console.error('Error toggling apartment status:', error);
      toast.error(error.message || 'Ошибка при изменении статуса объявления');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteApartment(apartment.id);
      onDelete(apartment.id);
      toast.success('Объявление успешно удалено');
    } catch (error) {
      console.error('Error deleting apartment:', error);
      toast.error(error.message || 'Ошибка при удалении объявления');
    }
  };

  const nextImage = useCallback((e) => {
    e.stopPropagation();
    if (!apartment.image_count || apartment.image_count <= 1 || isImageLoading) return;
    const newIndex = (currentImageIndex + 1) % apartment.image_count;
    handleImageChange(newIndex);
  }, [apartment.image_count, currentImageIndex, handleImageChange, isImageLoading]);

  const prevImage = useCallback((e) => {
    e.stopPropagation();
    if (!apartment.image_count || apartment.image_count <= 1 || isImageLoading) return;
    const newIndex = (currentImageIndex - 1 + apartment.image_count) % apartment.image_count;
    handleImageChange(newIndex);
  }, [apartment.image_count, currentImageIndex, handleImageChange, isImageLoading]);

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${!apartment.is_active ? 'opacity-60' : ''}`}>
        <div className="relative aspect-video">
          {apartment.image_count > 0 ? (
            <>
              <div className="relative w-full h-full">
                <img
                  src={getImageUrl(currentImageIndex)}
                  alt={apartment.complex}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-50' : 'opacity-100'}`}
                  loading="lazy"
                  decoding="async"
                  fetchpriority={currentImageIndex === 0 ? "high" : "low"}
                  onLoad={() => setIsImageLoading(false)}
                />
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <FaSpinner className="animate-spin text-4xl text-white" />
                  </div>
                )}
              </div>
              {apartment.image_count > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors disabled:opacity-50"
                    disabled={isImageLoading}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors disabled:opacity-50"
                    disabled={isImageLoading}
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
              onClick={() => setShowDeleteConfirm(true)}
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
                checked={apartment.is_active}
                onChange={handleToggleActive}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm text-gray-600">
                {apartment.is_active ? 'Активно' : 'Неактивно'}
              </span>
            </label>
          </div>

          <div>
            <ApartmentAvailabilityCard apartment={apartment} />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Удаление объявления"
        message="Вы уверены, что хотите удалить это объявление? Это действие нельзя будет отменить."
      />
    </>
  );
};

export default React.memo(ApartmentCard); 