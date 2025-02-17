import React, { useState, useEffect } from 'react';
import { FaEdit, FaPlus } from 'react-icons/fa';
import ApartmentForm from './ApartmentForm';

const MyApartments = () => {
  const [apartments, setApartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (formData) => {
    try {
      const url = editingApartment 
        ? `/api/apartments/${editingApartment.id}`
        : '/api/apartments';
      
      const method = editingApartment ? 'PUT' : 'POST';

      // Создаем объект для отправки основных данных
      const data = {
        complex: formData.get('complex'),
        rooms: parseInt(formData.get('rooms')),
        price: parseInt(formData.get('price')),
        description: formData.get('description'),
        address: formData.get('address'),
        area: parseFloat(formData.get('area')),
        floor: parseInt(formData.get('floor')),
        amenities: JSON.parse(formData.get('amenities')),
        location: formData.get('location'),
        rules: formData.get('rules')
      };

      // Отправляем основные данные
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save apartment');
      }

      const responseData = await response.json();
      const apartmentId = editingApartment ? editingApartment.id : responseData.id;

      // Если есть файлы для загрузки
      const files = formData.getAll('images');
      if (files.length > 0) {
        const imageFormData = new FormData();
        files.forEach(file => {
          imageFormData.append('images', file);
        });

        const imageResponse = await fetch(`/api/apartments/${apartmentId}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: imageFormData
        });

        if (!imageResponse.ok) {
          throw new Error('Failed to upload images');
        }
      }

      await fetchApartments();
      setShowForm(false);
      setEditingApartment(null);
    } catch (error) {
      console.error('Error saving apartment:', error);
      setError(error.message);
    }
  };

  const handleEdit = (apartment) => {
    setEditingApartment(apartment);
    setShowForm(true);
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
              <div key={apartment.id} className="border rounded-lg p-4">
                <div className="relative">
                  {apartment.images?.[0] && (
                    <img
                      src={apartment.images[0]}
                      alt={apartment.complex}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(apartment)}
                      className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <FaEdit className="text-blue-600" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{apartment.complex}</h3>
                <p className="text-gray-600 mb-2">{apartment.rooms}-комнатная</p>
                <p className="font-bold text-xl text-blue-600">
                  {apartment.price.toLocaleString()} ₸
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyApartments; 