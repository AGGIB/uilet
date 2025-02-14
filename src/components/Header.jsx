import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaRegBuilding } from 'react-icons/fa';
import Logo from '../assets/logo';
import { useModal } from '../contexts/ModalContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { setShowConsultation } = useModal();

  const handleCreateListing = () => {
    navigate('/auth');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Левая часть */}
          <div className="flex items-center gap-8">
            <Link to="/" className="h-8 w-auto">
              <Logo />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Стоимость
              </Link>
              <button 
                onClick={() => setShowConsultation(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                Консультация
              </button>
            </nav>
          </div>

          {/* Правая часть */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={handleCreateListing}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <FaRegBuilding />
              <span>Создать объявление</span>
            </button>
            <Link
              to="/auth"
              className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Войти
            </Link>
          </div>

          {/* Мобильное меню */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Мобильное меню выпадающее */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-2 space-y-3">
            <Link 
              to="/pricing" 
              className="block py-2 text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Стоимость
            </Link>
            <button 
              onClick={() => {
                setShowConsultation(true);
                setIsMenuOpen(false);
              }}
              className="block py-2 text-gray-600 w-full text-left"
            >
              Консультация
            </button>
            <button
              onClick={() => {
                navigate('/auth');
                setIsMenuOpen(false);
              }}
              className="block py-2 text-gray-600 w-full text-left"
            >
              Создать объявление
            </button>
            <Link
              to="/auth"
              className="block py-2 text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Войти
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 