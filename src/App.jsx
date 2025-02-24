import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModalProvider } from './contexts/ModalContext';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard/Dashboard';
import ClientSite from './components/ClientSite/ClientSite';
import PricingPage from './components/PricingPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from './components/ForgotPassword';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ModalProvider>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <Routes>
                {/* Главная страница платформы */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Страница входа */}
                <Route path="/auth" element={<AuthScreen isRegister={false} />} />
                
                {/* Страница регистрации */}
                <Route path="/register" element={<AuthScreen isRegister={true} />} />
                
                {/* Личный кабинет арендодателя */}
                <Route 
                  path="/dashboard/*" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                
                {/* Сайт для клиентов (по поддомену) */}
                <Route path="/site/:siteId/*" element={<ClientSite />} />
                
                <Route path="/pricing" element={<PricingPage />} />

                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </ModalProvider>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App; 