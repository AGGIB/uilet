import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes, FaArrowLeft, FaWifi, FaParking, FaSnowflake, FaWater, FaUtensils } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';
import { api } from '../../api/api';

const ApartmentForm = ({ apartment, onSubmit, isEdit = false, onBack }) => {
  const amenitiesConfig = {
    wifi: {
      icon: <FaWifi className="text-lg text-gray-600" />,
      label: 'Wi-Fi'
    },
    parking: {
      icon: <FaParking className="text-lg text-gray-600" />,
      label: 'Парковка'
    },
    ac: {
      icon: <FaSnowflake className="text-lg text-gray-600" />,
      label: 'Кондиционер'
    },
    washer: {
      icon: <FaWater className="text-lg text-gray-600" />,
      label: 'Стиральная машина'
    },
    kitchen: {
      icon: <FaUtensils className="text-lg text-gray-600" />,
      label: 'Кухня'
    }
  };

  const [formData, setFormData] = useState(() => ({
    complex: apartment?.complex || '',
    rooms: apartment?.rooms || '',
    price: apartment?.price || '',
    description: apartment?.description || '',
    address: apartment?.address || '',
    area: apartment?.area || '',
    floor: apartment?.floor || '',
    location: apartment?.location || '',
    rules: apartment?.rules || '',
    is_active: apartment?.is_active ?? true,
    amenities: apartment?.amenities || {
      wifi: false,
      parking: false,
      ac: false,
      washer: false,
      kitchen: false,
    }
  }));

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  useEffect(() => {
    if (apartment && apartment.image_count > 0) {
      const urls = Array.from({ length: apartment.image_count }, (_, index) => 
        `${api.getImageUrl(apartment.id, index)}?t=${Date.now()}`
      );
      setExistingImages(urls);
    } else {
      setExistingImages([]);
    }
  }, [apartment, apartment?.image_count]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Проверяем размер и тип файлов
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.warning('Некоторые файлы были пропущены. Поддерживаются изображения JPG, PNG, GIF размером до 5MB');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeNewImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      prev[index] && URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const handleDeleteImage = (index) => {
    setImageToDelete(index);
    setShowDeleteImageConfirm(true);
  };

  const removeExistingImage = async () => {
    if (imageToDelete === null) return;

    try {
      await api.deleteImage(apartment.id, imageToDelete);
      setExistingImages(prev => prev.filter((_, i) => i !== imageToDelete));
      const updatedApartment = await api.getApartment(apartment.id);
      onSubmit({
        type: 'update',
        id: apartment.id,
        data: updatedApartment
      });
      toast.success('Изображение успешно удалено');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(error.message || 'Ошибка при удалении изображения');
    }
    setImageToDelete(null);
    setShowDeleteImageConfirm(false);
  };

  const handleNumberInput = (e, field) => {
    // Разрешаем только цифры и точку для площади
    let value = e.target.value;
    if (field === 'area') {
      value = value.replace(/[^0-9.]/g, '');
    } else {
      value = value.replace(/[^0-9]/g, '');
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const jsonData = {
        complex: formData.complex,
        rooms: parseInt(String(formData.rooms).replace(/[^0-9]/g, '')) || 0,
        price: parseInt(String(formData.price).replace(/[^0-9]/g, '')) || 0,
        area: parseFloat(String(formData.area).replace(/[^0-9.]/g, '')) || 0,
        floor: parseInt(String(formData.floor).replace(/[^0-9]/g, '')) || 0,
        description: formData.description || '',
        address: formData.address || '',
        location: formData.location || '',
        rules: formData.rules || '',
        amenities: formData.amenities || {},
        is_active: formData.is_active
      };

      // Добавляем изображения только если они есть
      const data = { ...jsonData };
      if (selectedFiles.length > 0) {
        data.images = selectedFiles;
      }

      await onSubmit({
        type: isEdit ? 'update' : 'create',
        id: apartment?.id,
        data: data
      });

      // Очищаем временные URL и сбрасываем выбранные файлы
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error('Error saving apartment:', error);
      toast.error(error.message || 'Ошибка при сохранении объявления');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft />
          <span>Назад к объявлениям</span>
        </button>
        <h2 className="text-xl font-bold">
          {isEdit ? 'Редактирование объявления' : 'Новое объявление'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">Название ЖК</label>
            <input
              type="text"
              value={formData.complex}
              onChange={(e) => setFormData({ ...formData, complex: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Количество комнат</label>
            <input
              type="text"
              value={formData.rooms}
              onChange={(e) => handleNumberInput(e, 'rooms')}
              placeholder="Количество комнат"
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Цена (тенге)</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => handleNumberInput(e, 'price')}
              placeholder="Цена"
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Площадь (м²)</label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => handleNumberInput(e, 'area')}
              placeholder="Площадь"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Этаж</label>
            <input
              type="text"
              value={formData.floor}
              onChange={(e) => handleNumberInput(e, 'floor')}
              placeholder="Этаж"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Адрес</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border rounded-lg"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Правила проживания</label>
          <textarea
            value={formData.rules}
            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            className="w-full p-3 border rounded-lg"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Удобства</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(amenitiesConfig).map(([key, config]) => (
              <label key={key} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.amenities[key]}
                  onChange={(e) => setFormData({
                    ...formData,
                    amenities: {
                      ...formData.amenities,
                      [key]: e.target.checked
                    }
                  })}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  {config.icon}
                  <span>{config.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Фотографии</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Существующие изображения */}
            {existingImages.map((url, index) => (
              <div key={`existing-${index}`} className="relative">
                <img
                  src={url}
                  alt=""
                  className="w-full h-32 object-cover rounded-lg"
                  crossOrigin="anonymous"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <FaTimes />
                </button>
              </div>
            ))}

            {/* Новые изображения */}
            {previewUrls.map((url, index) => (
              <div key={`new-${index}`} className="relative">
                <img
                  src={url}
                  alt=""
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <FaTimes />
                </button>
                <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                  Новое
                </div>
              </div>
            ))}

            {/* Кнопка добавления */}
            <label className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <FaUpload className="text-2xl mb-2" />
              <span className="text-sm">Добавить фото</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-lg flex items-center justify-center`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Сохранение...
            </>
          ) : (
            isEdit ? 'Сохранить изменения' : 'Добавить объявление'
          )}
        </button>
      </form>

      <ConfirmModal
        isOpen={showDeleteImageConfirm}
        onClose={() => {
          setShowDeleteImageConfirm(false);
          setImageToDelete(null);
        }}
        onConfirm={removeExistingImage}
        title="Удаление изображения"
        message="Вы уверены, что хотите удалить это изображение? Это действие нельзя будет отменить."
      />
    </>
  );
};

export default ApartmentForm; 