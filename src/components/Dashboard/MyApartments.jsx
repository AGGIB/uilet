import React, { useState, useEffect } from 'react';
import { FaEdit, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { api } from '../../api/api';
import ApartmentForm from './ApartmentForm';
import ApartmentCard from './ApartmentCard';

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
      setLoading(true);
      const data = await api.getApartments();
      setApartments(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      setError(error.message || 'Ошибка при загрузке объявлений');
      toast.error(error.message || 'Ошибка при загрузке объявлений');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (action) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      const { images, ...jsonData } = action.data;
      formData.append('data', JSON.stringify(jsonData));
      
      if (images && images.length > 0) {
        images.forEach(file => {
          formData.append('images', file);
        });
      }

      if (action.type === 'update') {
        const updatedApartment = await api.updateApartment(action.id, formData);
        setApartments(prevApartments => 
          prevApartments.map(apt => 
            apt.id === action.id ? updatedApartment : apt
          )
        );
        toast.success('Объявление успешно обновлено');
      } else {
        await api.createApartment(formData);
        await fetchApartments();
        toast.success('Объявление успешно создано');
      }

      setShowForm(false);
      setEditingApartment(null);
    } catch (error) {
      console.error('Error saving apartment:', error);
      toast.error(error.message || 'Ошибка при сохранении объявления');
      await fetchApartments();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (apartmentId) => {
    try {
      setLoading(true);
      await api.deleteApartment(apartmentId);
      setApartments(prev => prev.filter(apt => apt.id !== apartmentId));
      toast.success('Объявление успешно удалено');
    } catch (error) {
      console.error('Error deleting apartment:', error);
      toast.error(error.message || 'Ошибка при удалении объявления');
      await fetchApartments();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (apartment) => {
    setEditingApartment(apartment);
    setShowForm(true);
  };

  const handleToggleActive = async (apartmentId) => {
    try {
      await api.toggleApartmentStatus(apartmentId);
      setApartments(prevApartments => 
        prevApartments.map(apt => 
          apt.id === apartmentId 
            ? { ...apt, is_active: !apt.is_active }
            : apt
        )
      );
      toast.success('Статус объявления изменен');
    } catch (error) {
      console.error('Error toggling apartment status:', error);
      toast.error(error.message || 'Ошибка при изменении статуса объявления');
    }
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingApartment(null);
  };

  if (loading && apartments.length === 0) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  if (error && apartments.length === 0) {
    return <div className="text-center text-red-500 py-4">Ошибка: {error}</div>;
  }

  return (
    <div>
      {showForm ? (
        <ApartmentForm
          apartment={editingApartment}
          onSubmit={handleSubmit}
          isEdit={!!editingApartment}
          onBack={handleBack}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Мои объявления</h2>
            <button
              onClick={() => {
                setEditingApartment(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <FaPlus />
              <span>Добавить</span>
            </button>
          </div>

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
        </>
      )}
    </div>
  );
};

export default MyApartments; 