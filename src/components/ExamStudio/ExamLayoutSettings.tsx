import React from 'react';
import { ExamLayoutConfig } from '../../types/exam';

interface ExamLayoutSettingsProps {
  layout: ExamLayoutConfig;
  onChange: (layout: ExamLayoutConfig) => void;
}

export const ExamLayoutSettings: React.FC<ExamLayoutSettingsProps> = ({ layout, onChange }) => {
  const handleGridChange = (field: keyof ExamLayoutConfig['grid'], value: unknown) => {
    onChange({
      ...layout,
      grid: { ...layout.grid, [field]: value },
    });
  };

  const handleVisibilityChange = (field: keyof ExamLayoutConfig['visibility']) => {
    onChange({
      ...layout,
      visibility: { ...layout.visibility, [field]: !layout.visibility[field] },
    });
  };

  return (
    <div className="p-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex flex-col gap-4 font-inter text-gray-800 dark:text-gray-200">
      <h2 className="text-xl font-semibold mb-2">Sayfa ve Tablo Ayarları</h2>

      <div className="flex flex-col gap-3">
        <h3 className="text-md font-medium border-b border-gray-200 dark:border-gray-700 pb-1">
          Görünürlük (Başlık)
        </h3>

        {Object.entries(layout.visibility).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm capitalize">{key.replace('show', '')} Göster</span>
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={() => handleVisibilityChange(key as keyof ExamLayoutConfig['visibility'])}
              className="toggle-checkbox rounded-full"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <h3 className="text-md font-medium border-b border-gray-200 dark:border-gray-700 pb-1">
          Tablo (Grid)
        </h3>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Sütun Sayısı (Cols)</label>
          <select
            className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
            value={layout.grid.cols}
            onChange={(e) => handleGridChange('cols', Number(e.target.value))}
          >
            <option value={1}>1 Sütun</option>
            <option value={2}>2 Sütun</option>
            <option value={3}>3 Sütun</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Aralık (Gap)</label>
          <select
            className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
            value={layout.grid.gap}
            onChange={(e) => handleGridChange('gap', Number(e.target.value))}
          >
            <option value={4}>Küçük (4px)</option>
            <option value={8}>Orta (8px)</option>
            <option value={16}>Büyük (16px)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Kenarlık Stili (Border)</label>
          <select
            className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
            value={layout.grid.borderStyle}
            onChange={(e) => handleGridChange('borderStyle', e.target.value)}
          >
            <option value="solid">Düz (Solid)</option>
            <option value="dashed">Kesik Çizgili (Dashed)</option>
            <option value="none">Yok (None)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
