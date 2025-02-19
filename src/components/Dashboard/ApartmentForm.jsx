import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';

const ApartmentForm = ({ apartment, onSubmit, isEdit = false }) => {
  const [formData, setFormData] = useState(() => {
    if (apartment) {
      return {
        ...apartment,
        amenities: apartment.amenities || {
          wifi: false,
          parking: false,
          ac: false,
          washer: false,
          kitchen: false,
        }
      };
    }
    return {
      complex: '',
      rooms: '',
      price: '',
      description: '',
      address: '',
      area: '',
      floor: '',
      location: '',
      rules: '',
      amenities: {
        wifi: false,
        parking: false,
        ac: false,
        washer: false,
        kitchen: false,
      }
    };
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (apartment && apartment.image_count > 0) {
      // Загружаем существующие изображения
      const urls = Array.from({ length: apartment.image_count }, (_, index) => 
        `/api/apartments/${apartment.id}/images/${index}`
      );
      setExistingImages(urls);
    }
  }, [apartment]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeNewImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (index) => {
    if (window.confirm('Вы уверены, что хотите удалить это изображение?')) {
      try {
        const response = await fetch(`/api/apartments/${apartment.id}/images/${index}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setExistingImages(prev => prev.filter((_, i) => i !== index));
        } else {
          alert('Ошибка при удалении изображения');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Ошибка при удалении изображения');
      }
    }
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
      const formDataToSend = new FormData();
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
        amenities: formData.amenities || {}
      };

      formDataToSend.append('data', JSON.stringify(jsonData));
      
      // Добавляем все выбранные файлы
      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`images`, file); // Используем одно и то же имя поля для всех файлов
      });

      if (isEdit) {
        const response = await fetch(`/api/apartments/${apartment.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataToSend
        });

        if (!response.ok) {
          throw new Error('Failed to update apartment');
        }

        onSubmit({ type: 'update', id: apartment.id });
      } else {
        await onSubmit({ type: 'create', data: formDataToSend });
      }
    } catch (error) {
      console.error('Error saving apartment:', error);
      alert('Ошибка при сохранении объявления');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          {Object.keys(formData.amenities).map(amenity => (
            <label key={amenity} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.amenities[amenity]}
                onChange={(e) => setFormData({
                  ...formData,
                  amenities: {
                    ...formData.amenities,
                    [amenity]: e.target.checked
                  }
                })}
              />
              <span className="capitalize">{amenity}</span>
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
                onClick={() => removeExistingImage(index)}
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
  );
};

export default ApartmentForm; 