import React, { createContext, useContext, useState } from 'react';
import ConsultationModal from '../components/ConsultationModal';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [showConsultation, setShowConsultation] = useState(false);

  return (
    <ModalContext.Provider value={{ setShowConsultation }}>
      {children}
      {showConsultation && (
        <div className="fixed inset-0 z-[100]">
          <ConsultationModal onClose={() => setShowConsultation(false)} />
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext); 