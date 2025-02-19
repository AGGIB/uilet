import React, { useState, useEffect } from 'react';
import { FaEdit, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ApartmentForm from './ApartmentForm';
import ApartmentCard from './ApartmentCard';

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
      // Добавим логирование для отладки
      console.log('Fetching apartments...');
      console.log('Token:', localStorage.getItem('token'));
      
      const response = await fetch('http://localhost:8080/api/apartments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch apartments');
      }
      
      setApartments(data || []);
    } catch (error) {
      console.error('Error details:', error);
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
    if (!dateStr || dateStr === '') return 'Не указано';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Не указано';
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Не указано';
    }
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

  const handleToggleActive = async (apartmentId) => {
    setApartments(prevApartments => 
      prevApartments.map(apt => 
        apt.id === apartmentId 
          ? { ...apt, is_active: !apt.is_active }
          : apt
      )
    );
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {apartments.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              У вас пока нет объявлений
          </div>
        ) : (
          apartments.map(apartment => (
              <ApartmentCard
              key={apartment.id}
                apartment={apartment}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyApartments; 