import React, { useState, useEffect } from 'react';
import BookingCalendar from '../Calendar/BookingCalendar';
import Modal from '../UI/Modal';

const ApartmentAvailabilityCard = ({ apartment }) => {
  const [showModal, setShowModal] = useState(false);
  const [availabilities, setAvailabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchAvailabilities();
    }
  }, [showModal, apartment.id]);

  const fetchAvailabilities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/apartments/${apartment.id}/availabilities`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch availabilities');
      }

      const data = await response.json();
      setAvailabilities(data);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Показать календарь
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Календарь доступности"
      >
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow">
                <BookingCalendar
                  availabilities={availabilities}
                  isReadOnly={true}
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Источники бронирований:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-50 rounded"></div>
                    <span>Свободно</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-50 rounded"></div>
                    <span>Забронировано на Uilet.kz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-50 rounded"></div>
                    <span>Забронировано на Airbnb</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-50 rounded"></div>
                    <span>Забронировано на Booking.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-50 rounded"></div>
                    <span>Прошедшие даты</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ApartmentAvailabilityCard; 