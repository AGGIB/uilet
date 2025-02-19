import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
         isSameDay, addMonths, subMonths, isWithinInterval, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa';

const BookingCalendar = ({ 
  availabilities = [], 
  onDateSelect,
  onAvailabilityClick,
  isReadOnly = false,
  isActive = true // новый проп для активности объявления
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showInfo, setShowInfo] = useState(null);
  const [selectionStart, setSelectionStart] = useState(null);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDateStatus = (date) => {
    // Если объявление неактивно, все даты заблокированы
    if (!isActive) {
      return { status: 'blocked', data: null };
    }

    // Проверяем, не прошедшая ли это дата
    if (isBefore(date, new Date())) {
      return { status: 'past', data: null };
    }

    // Проверяем наличие бронирований
    for (const availability of availabilities) {
      const start = new Date(availability.date_start);
      const end = new Date(availability.date_end);
      
      if (isWithinInterval(date, { start, end })) {
        return {
          status: availability.status,
          data: availability
        };
      }
    }

    // По умолчанию дата свободна
    return { status: 'available', data: null };
  };

  const handleDateClick = (date) => {
    if (isReadOnly || !isActive) return;

    if (!selectionStart) {
      setSelectionStart(date);
    } else {
      const start = selectionStart < date ? selectionStart : date;
      const end = selectionStart < date ? date : selectionStart;
      
      onDateSelect({
        date_start: format(start, 'yyyy-MM-dd'),
        date_end: format(end, 'yyyy-MM-dd'),
        status: 'blocked' // При выборе дат они блокируются
      });
      
      setSelectionStart(null);
    }
  };

  const getStatusColor = (status, source) => {
    if (status === 'booked') {
      switch (source) {
        case 'airbnb':
          return 'bg-orange-50 text-orange-600 cursor-not-allowed';
        case 'booking':
          return 'bg-yellow-50 text-yellow-600 cursor-not-allowed';
        default:
          return 'bg-red-50 text-red-600 cursor-not-allowed';
      }
    }
    
    switch (status) {
      case 'available':
        return 'bg-green-50 hover:bg-green-100 text-green-600';
      case 'past':
        return 'bg-gray-50 text-gray-400 cursor-not-allowed';
      default:
        return 'hover:bg-gray-50';
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaChevronLeft />
        </button>
        <h2 className="text-lg font-medium">
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </h2>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
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
          const dateStatus = getDateStatus(day);
          const isSelected = selectionStart && isSameDay(day, selectionStart);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => dateStatus.data && setShowInfo(dateStatus.data)}
              onMouseLeave={() => setShowInfo(null)}
              className={`
                relative p-2 text-sm rounded-lg transition-colors
                ${!isSameMonth(day, currentDate) && 'text-gray-300'}
                ${isSelected && 'ring-2 ring-blue-500'}
                ${getStatusColor(dateStatus.status, dateStatus.data?.source)}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Легенда */}
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-50 rounded"></div>
          <span>Свободно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-50 rounded"></div>
          <span>Забронировано</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-50 rounded"></div>
          <span>Заблокировано</span>
        </div>
      </div>

      {/* Информация о бронировании */}
      {showInfo && (
        <div className="absolute bg-white shadow-lg rounded-lg p-4 mt-2 z-50">
          <div className="flex items-start gap-2">
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium">
                  {showInfo.guest_name || 'Забронировано'}
                </p>
                {showInfo.source && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100">
                    {showInfo.source === 'airbnb' ? 'Airbnb' : 
                     showInfo.source === 'booking' ? 'Booking.com' : 
                     'Uilet.kz'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {format(new Date(showInfo.date_start), 'd MMM', { locale: ru })} - 
                {format(new Date(showInfo.date_end), 'd MMM', { locale: ru })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar; 