import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaWifi, FaTv, FaParking, 
  FaSnowflake, FaUtensils, FaWater } from 'react-icons/fa';

const AmenityToggle = ({ icon: Icon, label, value, onChange }) => (
  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
    <input
      type="checkbox"
      checked={value}
      onChange={onChange}
      className="hidden"
    />
    <Icon className={value ? "text-blue-600" : "text-gray-400"} />
    <span className={value ? "text-blue-600" : "text-gray-600"}>{label}</span>
  </label>
);

const MyApartments = () => {
  const [apartments, setApartments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApartment, setNewApartment] = useState({
    complex: '',
    rooms: '',
    price: '',
    description: '',
    images: [],
    amenities: {
      wifi: false,
      tv: false,
      parking: false,
      ac: false,
      kitchen: false,
      water: false
    }
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setNewApartment(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApartments(prev => [...prev, { ...newApartment, id: Date.now() }]);
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Мои объявления</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <FaPlus />
          <span>Добавить квартиру</span>
        </button>
      </div>

      {/* Список квартир */}
      <div className="space-y-4">
        {apartments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            У вас пока нет объявлений. Добавьте первое!
          </div>
        ) : (
          apartments.map(apartment => (
            <div
              key={apartment.id}
              className="border rounded-lg p-4"
            >
              <div className="flex gap-4">
                {/* Изображение */}
                <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  {apartment.images.length > 0 ? (
                    <img 
                      src={apartment.images[0]} 
                      alt={apartment.complex}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Нет фото</span>
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{apartment.complex}</h3>
                      <p className="text-gray-600">{apartment.rooms}х - комнатная</p>
                      <p className="text-lg font-medium mt-2">{apartment.price} ₸/сутки</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <FaEdit />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Удобства */}
                  <div className="flex gap-3 mt-3">
                    {Object.entries(apartment.amenities).map(([key, value]) => {
                      if (!value) return null;
                      const icons = {
                        wifi: FaWifi,
                        tv: FaTv,
                        parking: FaParking,
                        ac: FaSnowflake,
                        kitchen: FaUtensils,
                        water: FaWater
                      };
                      const Icon = icons[key];
                      return (
                        <Icon key={key} className="text-blue-600" />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Форма добавления квартиры */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl m-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Добавить квартиру</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Основная информация */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Название ЖК
                  </label>
                  <input
                    type="text"
                    value={newApartment.complex}
                    onChange={e => setNewApartment(prev => ({
                      ...prev,
                      complex: e.target.value
                    }))}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Количество комнат
                  </label>
                  <input
                    type="number"
                    value={newApartment.rooms}
                    onChange={e => setNewApartment(prev => ({
                      ...prev,
                      rooms: e.target.value
                    }))}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Цена за сутки
                  </label>
                  <input
                    type="number"
                    value={newApartment.price}
                    onChange={e => setNewApartment(prev => ({
                      ...prev,
                      price: e.target.value
                    }))}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Загрузка фотографий */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Фотографии
                </label>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {newApartment.images.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden relative group">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => setNewApartment(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index)
                        }))}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <FaPlus className="text-gray-400" />
                  </label>
                </div>
              </div>

              {/* Удобства */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Удобства
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <AmenityToggle
                    icon={FaWifi}
                    label="Wi-Fi"
                    value={newApartment.amenities.wifi}
                    onChange={() => setNewApartment(prev => ({
                      ...prev,
                      amenities: {
                        ...prev.amenities,
                        wifi: !prev.amenities.wifi
                      }
                    }))}
                  />
                  <AmenityToggle
                    icon={FaTv}
                    label="Телевизор"
                    value={newApartment.amenities.tv}
                    onChange={() => setNewApartment(prev => ({
                      ...prev,
                      amenities: {
                        ...prev.amenities,
                        tv: !prev.amenities.tv
                      }
                    }))}
                  />
                  <AmenityToggle
                    icon={FaParking}
                    label="Парковка"
                    value={newApartment.amenities.parking}
                    onChange={() => setNewApartment(prev => ({
                      ...prev,
                      amenities: {
                        ...prev.amenities,
                        parking: !prev.amenities.parking
                      }
                    }))}
                  />
                  <AmenityToggle
                    icon={FaSnowflake}
                    label="Кондиционер"
                    value={newApartment.amenities.ac}
                    onChange={() => setNewApartment(prev => ({
                      ...prev,
                      amenities: {
                        ...prev.amenities,
                        ac: !prev.amenities.ac
                      }
                    }))}
                  />
                  <AmenityToggle
                    icon={FaUtensils}
                    label="Кухня"
                    value={newApartment.amenities.kitchen}
                    onChange={() => setNewApartment(prev => ({
                      ...prev,
                      amenities: {
                        ...prev.amenities,
                        kitchen: !prev.amenities.kitchen
                      }
                    }))}
                  />
                  <AmenityToggle
                    icon={FaWater}
                    label="Вода"
                    value={newApartment.amenities.water}
                    onChange={() => setNewApartment(prev => ({
                      ...prev,
                      amenities: {
                        ...prev.amenities,
                        water: !prev.amenities.water
                      }
                    }))}
                  />
                </div>
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Описание
                </label>
                <textarea
                  value={newApartment.description}
                  onChange={e => setNewApartment(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={4}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Кнопки */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApartments; 