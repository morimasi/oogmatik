import React from 'react';

interface ExamActionBarProps {
  onSave: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onAddToWorkbook: () => void;
  onShare?: () => void;
  onAssign?: () => void;
}

export const ExamActionBar: React.FC<ExamActionBarProps> = ({
  onSave,
  onPrint,
  onDownload,
  onAddToWorkbook,
  onShare,
  onAssign,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mt-6">
      <button
        onClick={onSave}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all"
      >
        <i className="fa-solid fa-save"></i>
        Kaydet
      </button>
      {onAssign && (
        <button
          onClick={onAssign}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all"
        >
          <i className="fa-solid fa-user-graduate"></i>
          Öğrenciye Ata
        </button>
      )}
      {onShare && (
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition-all"
        >
          <i className="fa-solid fa-share-nodes"></i>
          Paylaş
        </button>
      )}
      <button
        onClick={onPrint}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
      >
        <i className="fa-solid fa-print"></i>
        Yazdır
      </button>
      <button
        onClick={onDownload}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all"
      >
        <i className="fa-solid fa-download"></i>
        PDF İndir
      </button>
      <button
        onClick={onAddToWorkbook}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-all"
      >
        <i className="fa-solid fa-book-open"></i>
        Kitapçığa Ekle
      </button>
    </div>
  );
};
