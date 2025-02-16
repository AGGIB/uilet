import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaRegBuilding } from 'react-icons/fa';
import Logo from '../assets/logo';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { setShowConsultation } = useModal();
  const { currentUser } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Логотип */}
          <Link to="/" className="h-8 w-auto">
            <Logo />
          </Link>

          {/* Центральная навигация */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate(currentUser ? '/dashboard' : '/auth')}
                className="text-gray-600 hover:text-gray-900"
              >
                Дэшборд
              </button>
              <button 
                onClick={() => setShowConsultation(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                Консультация
              </button>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Стоимость
              </Link>
              <Link to="/blog" className="text-gray-600 hover:text-gray-900">
                Блог
              </Link>
            </nav>
          </div>

          {/* Правая часть */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Дэшборд
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700"
                >
                  Войти
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaRegBuilding />
                  <span>Создать объявление</span>
                </button>
              </>
            )}
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
            <button
              onClick={() => {
                navigate(currentUser ? '/dashboard' : '/auth');
                setIsMenuOpen(false);
              }}
              className="block py-2 text-gray-600 w-full text-left"
            >
              Дэшборд
            </button>
            <button 
              onClick={() => {
                setShowConsultation(true);
                setIsMenuOpen(false);
              }}
              className="block py-2 text-gray-600 w-full text-left"
            >
              Консультация
            </button>
            <Link 
              to="/pricing" 
              className="block py-2 text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Стоимость
            </Link>
            <Link 
              to="/blog" 
              className="block py-2 text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Блог
            </Link>
            {!currentUser && (
              <>
                <button
                  onClick={() => {
                    navigate('/auth');
                    setIsMenuOpen(false);
                  }}
                  className="block py-2 text-gray-600 w-full text-left"
                >
                  Войти
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setIsMenuOpen(false);
                  }}
                  className="block py-2 text-gray-600 w-full text-left flex items-center gap-2"
                >
                  <FaRegBuilding />
                  <span>Создать объявление</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 