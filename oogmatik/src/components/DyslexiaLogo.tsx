// @ts-nocheck
import React from 'react';

const DyslexiaLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/assets/logo.png"
        alt="Bursa Disleksi Logo"
        className="h-10 w-auto object-contain shrink-0"
      />
    </div>
  );
};

export default DyslexiaLogo;