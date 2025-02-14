import React from 'react';
import { FaLock } from 'react-icons/fa';

const FooterBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
      <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
        <FaLock className="text-gray-400 text-sm" />
        <span className="text-gray-600">uilet.kz</span>
      </div>
    </div>
  );
};

export default FooterBar; 