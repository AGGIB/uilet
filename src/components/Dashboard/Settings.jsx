import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';

const Settings = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Настройки</h2>
      
      <div className="space-y-4">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 text-red-600 w-full p-3 rounded-lg hover:bg-red-50"
        >
          <FaTrash />
          <span>Удалить профиль</span>
        </button>
      </div>

      {/* Подтверждение удаления */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Удалить профиль?</h3>
            <p className="text-gray-600 mb-6">
              Это действие нельзя будет отменить. Все ваши данные будут удалены.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  // Здесь будет логика удаления профиля
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 