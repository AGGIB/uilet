import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const BookingCalendar = ({ 
  selectedDates = [], 
  onDateSelect, 
  bookedDates = [], 
  isReadOnly = false 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const isDateBooked = (date) => {
    return bookedDates.some(bookedDate => 
      isSameDay(new Date(bookedDate), date)
    );
  };

  const isDateSelected = (date) => {
    return selectedDates.some(selectedDate => 
      isSameDay(new Date(selectedDate), date)
    );
  };

  const handleDateClick = (date) => {
    if (isReadOnly || isDateBooked(date)) return;
    onDateSelect(date);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <FaChevronLeft />
        </button>
        <h2 className="text-lg font-medium">
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <FaChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center text-sm text-gray-500 py-2">
            {day}
          </div>
        ))}

        {monthDays.map(day => {
          const isBooked = isDateBooked(day);
          const isSelected = isDateSelected(day);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              disabled={isReadOnly || isBooked}
              className={`
                p-2 rounded-lg text-sm relative
                ${!isSameMonth(day, currentDate) && 'text-gray-300'}
                ${isBooked && 'bg-red-50 text-red-600 cursor-not-allowed'}
                ${isSelected && 'bg-blue-50 text-blue-600'}
                ${!isBooked && !isSelected && 'hover:bg-gray-50'}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookingCalendar; 