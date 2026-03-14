import React from 'react';
import TurkceSuperStudyoLayout from './layout';
import TurkceSuperStudyoPage from './page';

export default function TurkceSuperStudyoEntry({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-0 bg-white z-[60] overflow-y-auto">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-[70] flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
      >
        <i className="fa-solid fa-arrow-left"></i>
      </button>
      <TurkceSuperStudyoLayout>
        <TurkceSuperStudyoPage />
      </TurkceSuperStudyoLayout>
    </div>
  );
}
