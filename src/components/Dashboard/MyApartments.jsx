import React, { useState, useEffect } from 'react';
import { FaEdit, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ApartmentForm from './ApartmentForm';

const MyApartments = () => {
  const [apartments, setApartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const response = await fetch('/api/apartments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch apartments');
      }
      
      const data = await response.json();
      setApartments(data || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (action) => {
    try {
      if (action.type === 'update') {
        setLoading(true);
        // Делаем небольшую задержку перед запросом обновленных данных
        await new Promise(resolve => setTimeout(resolve, 500));

        // Обновляем только конкретное объявление
        const response = await fetch(`/api/apartments/${action.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch updated apartment');
        }

        const updatedApartment = await response.json();
        
        // Обновляем состояние только для измененного объявления
        setApartments(prev => prev.map(apt => 
          apt.id === action.id ? updatedApartment : apt
        ));

        setShowForm(false);
        setEditingApartment(null);
        setCurrentImageIndex({});
      } else if (action.type === 'create') {
        setLoading(true);
        const response = await fetch('/api/apartments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: action.data
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Ошибка при сохранении объявления');
        }

        // Обновляем весь список после создания
        await fetchApartments();
        setShowForm(false);
        setEditingApartment(null);
        setCurrentImageIndex({});
      }
    } catch (error) {
      console.error('Error saving apartment:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (apartmentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }

    try {
      const response = await fetch(`/api/apartments/${apartmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при удалении объявления');
      }

      await fetchApartments();
    } catch (error) {
      console.error('Error deleting apartment:', error);
      setError(error.message);
    }
  };

  const handleEdit = (apartment) => {
    setEditingApartment(apartment);
    setShowForm(true);
  };

  const getImageUrl = (apartmentId, index) => {
    if (!apartmentId) return '';
    return `/api/apartments/${apartmentId}/images/${index}`;
  };

  const hasImages = (apartment) => {
    return apartment.image_count > 0;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const nextImage = (apartmentId, e) => {
    e.stopPropagation();
    const apartment = apartments.find(a => a.id === apartmentId);
    if (!apartment || apartment.image_count <= 1) return;

    setCurrentImageIndex(prev => ({
      ...prev,
      [apartmentId]: ((prev[apartmentId] || 0) + 1) % apartment.image_count
    }));
  };

  const prevImage = (apartmentId, e) => {
    e.stopPropagation();
    const apartment = apartments.find(a => a.id === apartmentId);
    if (!apartment || apartment.image_count <= 1) return;

    setCurrentImageIndex(prev => ({
      ...prev,
      [apartmentId]: ((prev[apartmentId] || 0) - 1 + apartment.image_count) % apartment.image_count
    }));
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">Ошибка: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Мои объявления</h2>
        <button
          onClick={() => {
            setEditingApartment(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus />
          <span>Добавить</span>
        </button>
      </div>

      {showForm ? (
        <ApartmentForm
          apartment={editingApartment}
          onSubmit={handleSubmit}
          isEdit={!!editingApartment}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apartments.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              У вас пока нет объявлений
            </div>
          ) : (
            apartments.map(apartment => (
              <div key={apartment.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  {apartment.image_count > 0 ? (
                    <>
                      <img
                        src={getImageUrl(apartment.id, currentImageIndex[apartment.id] || 0)}
                        alt={apartment.complex}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`Error loading image for apartment ${apartment.id}`);
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-400">Ошибка загрузки фото</span></div>';
                        }}
                        crossOrigin="anonymous"
                      />
                      {apartment.image_count > 1 && (
                        <>
                          <button
                            onClick={(e) => prevImage(apartment.id, e)}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white z-10"
                          >
                            <FaChevronLeft className="text-gray-700" />
                          </button>
                          <button
                            onClick={(e) => nextImage(apartment.id, e)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white z-10"
                          >
                            <FaChevronRight className="text-gray-700" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/80 px-2 py-1 rounded-full text-sm z-10">
                            {(currentImageIndex[apartment.id] || 0) + 1} / {apartment.image_count}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Нет фото</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(apartment)}
                      className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <FaEdit className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(apartment.id)}
                      className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <FaTrash className="text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{apartment.complex}</h3>
                    <p className="font-bold text-xl text-blue-600">
                      {formatPrice(apartment.price)} ₸
                    </p>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{apartment.rooms}-комнатная</p>
                  
                  {apartment.description && (
                    <p className="text-gray-600 mb-2 line-clamp-2">{apartment.description}</p>
                  )}

                  {apartment.address && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Адрес:</span> {apartment.address}
                    </p>
                  )}

                  {apartment.area && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Площадь:</span> {apartment.area} м²
                    </p>
                  )}

                  {apartment.floor && (
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Этаж:</span> {apartment.floor}
                    </p>
                  )}

                  {apartment.available_dates && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Доступно с:</span> {formatDate(apartment.available_dates.start)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">До:</span> {formatDate(apartment.available_dates.end)}
                      </p>
                    </div>
                  )}

                  {apartment.amenities && Object.keys(apartment.amenities).length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="font-medium text-sm mb-1">Удобства:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(apartment.amenities)
                          .filter(([_, value]) => value)
                          .map(([key]) => (
                            <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {key === 'wifi' ? 'Wi-Fi' :
                               key === 'parking' ? 'Парковка' :
                               key === 'ac' ? 'Кондиционер' :
                               key === 'washer' ? 'Стиральная машина' :
                               key === 'kitchen' ? 'Кухня' : key}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyApartments; 