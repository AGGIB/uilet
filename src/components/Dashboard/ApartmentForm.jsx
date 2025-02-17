import React, { useState } from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ApartmentForm = ({ apartment, onSubmit, isEdit = false }) => {
  const [formData, setFormData] = useState(apartment || {
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
    },
    features: [],
    availableDates: [],
    images: []
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();

    // Добавляем основные поля
    Object.keys(formData).forEach(key => {
      if (key === 'amenities' || key === 'features') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key !== 'images') {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Добавляем изображения
    selectedFiles.forEach(file => {
      formDataToSend.append('images', file);
    });

    await onSubmit(formDataToSend);
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
            type="number"
            value={formData.rooms}
            onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Цена (тенге)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Площадь (м²)</label>
          <input
            type="number"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Этаж</label>
          <input
            type="number"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            className="w-full p-3 border rounded-lg"
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
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img src={url} alt="" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
              >
                <FaTimes />
              </button>
            </div>
          ))}
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

      <div>
        <label className="block text-sm font-medium mb-2">Свободные даты</label>
        <DatePicker
          selected={null}
          onChange={(dates) => setFormData({ ...formData, availableDates: dates })}
          startDate={formData.availableDates[0]}
          endDate={formData.availableDates[formData.availableDates.length - 1]}
          selectsRange
          inline
          className="w-full"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {isEdit ? 'Сохранить изменения' : 'Добавить объявление'}
      </button>
    </form>
  );
};

export default ApartmentForm; 