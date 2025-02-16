import React, { useState } from 'react';
import BookingCalendar from '../Calendar/BookingCalendar';

const CalendarManager = ({ apartmentId }) => {
  const [blockedDates, setBlockedDates] = useState([]);

  const handleDateSelect = (date) => {
    setBlockedDates(prev => {
      const dateStr = date.toISOString();
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      }
      return [...prev, dateStr];
    });
  };

  const handleSave = async () => {
    // TODO: Сохранение заблокированных дат в базу данных
    console.log('Сохранение дат:', blockedDates);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Календарь доступности</h2>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Сохранить изменения
        </button>
      </div>

      <div className="bg-white rounded-xl p-4">
        <p className="text-gray-600 mb-4">
          Выберите даты, когда квартира недоступна для бронирования
        </p>
        <BookingCalendar
          selectedDates={blockedDates}
          onDateSelect={handleDateSelect}
        />
      </div>
    </div>
  );
};

export default CalendarManager; 