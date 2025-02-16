import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaRobot, FaUser, FaChartBar, FaBars, FaTimes, 
  FaHeadset, FaFileExport, FaCog, FaPlug } from 'react-icons/fa';
import Logo from '../../assets/logo';
import MyApartments from './MyApartments';
import AISettings from './AISettings';
import Profile from './Profile';
import Analytics from './Analytics';
import Export from './Export';
import Settings from './Settings';
import CalendarManager from './CalendarManager';
import Integrations from './Integrations';
import AITesting from './AITesting';
import WhatsAppQRModal from './WhatsAppQRModal';

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
  >
    {children}
  </Link>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('apartments');
  const [siteUrl, setSiteUrl] = useState('mysite.uilet.kz');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'apartments':
        return <MyApartments siteUrl={siteUrl} />;
      case 'ai':
        return <AISettings />;
      case 'profile':
        return <Profile siteUrl={siteUrl} onSiteUrlChange={setSiteUrl} />;
      case 'analytics':
        return <Analytics />;
      case 'export':
        return <Export />;
      case 'settings':
        return <Settings />;
      case 'calendar':
        return <CalendarManager />;
      case 'integrations':
        return <Integrations />;
      case 'ai-testing':
        return <AITesting />;
      default:
        return <MyApartments siteUrl={siteUrl} />;
    }
  };

  const handleSupport = () => {
    window.open('https://wa.me/77001234567', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="h-8 w-auto">
                <Logo />
              </div>
              <nav className="hidden md:flex items-center gap-2">
                <NavLink to="/">Главная</NavLink>
                <a 
                  href="https://youtube.com/@uilet" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Туториалы
                </a>
                <NavLink to="/pricing">Стоимость</NavLink>
                <NavLink to="/blog">Блог</NavLink>
              </nav>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">Ваш сайт: </span>
              <a 
                href={`/site/mysite`} 
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                {siteUrl}
              </a>
            </div>
            <button 
              className="md:hidden p-2"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <FaBars className="text-gray-700 text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Меню</h2>
              <button onClick={() => setShowMobileMenu(false)}>
                <FaTimes className="text-gray-700 text-xl" />
              </button>
            </div>
            <nav className="space-y-2 mb-6">
              <Link 
                to="/"
                className="block w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Главная
              </Link>
              <a 
                href="https://youtube.com/@uilet"
                target="_blank"
                rel="noreferrer"
                className="block w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Туториалы
              </a>
              <Link 
                to="/pricing"
                className="block w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Стоимость
              </Link>
              <Link 
                to="/blog"
                className="block w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Блог
              </Link>
            </nav>
            <nav className="space-y-4">
              <button
                onClick={() => {
                  setActiveTab('apartments');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
              >
                <FaHome />
                <span>Мои объявления</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('ai');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
              >
                <FaRobot />
                <span>ИИ-ассистент</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('integrations');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
              >
                <FaPlug />
                <span>Интеграции</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
              >
                <FaChartBar />
                <span>Аналитика</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('export');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
              >
                <FaFileExport />
                <span>Экспорт</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
              >
                <FaUser />
                <span>Профиль</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
              >
                <FaCog />
                <span>Настройки</span>
              </button>
              <button
                onClick={handleSupport}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
              >
                <FaHeadset />
                <span>Поддержка</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar and Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - скрыт на мобильных */}
          <div className="hidden md:block w-64">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('apartments')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                    activeTab === 'apartments' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <FaHome />
                  <span>Мои объявления</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                    activeTab === 'ai' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <FaRobot />
                  <span>ИИ-ассистент</span>
                </button>
                <button
                  onClick={() => setActiveTab('integrations')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                    activeTab === 'integrations' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <FaPlug />
                  <span>Интеграции</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                    activeTab === 'analytics' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <FaChartBar />
                  <span>Аналитика</span>
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                    activeTab === 'export' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <FaFileExport />
                  <span>Экспорт</span>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                    activeTab === 'profile' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <FaUser />
                  <span>Профиль</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                    activeTab === 'settings' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <FaCog />
                  <span>Настройки</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai-testing')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                    activeTab === 'ai-testing' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <FaRobot />
                  <span>Тестирование ИИ</span>
                </button>
                <button
                  onClick={handleSupport}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  <FaHeadset />
                  <span>Поддержка</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp QR Modal */}
      <WhatsAppQRModal 
        isOpen={showWhatsAppModal} 
        onClose={() => setShowWhatsAppModal(false)} 
      />
    </div>
  );
};

export default Dashboard; 