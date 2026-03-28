import React from 'react';
import { ExamParams } from '../../services/generators/examGenerator';
import { ExamQuestionType } from '../../types/exam';

interface ExamConfigPanelProps {
  params: ExamParams;
  onChange: (params: ExamParams) => void;
}

const QUESTION_TYPES: { value: ExamQuestionType; label: string }[] = [
  { value: 'multiple-choice', label: 'Çoktan Seçmeli' },
  { value: 'true-false', label: 'Doğru-Yanlış' },
  { value: 'fill-in-blanks', label: 'Boşluk Doldurma' },
  { value: 'open-ended', label: 'Açık Uçlu' },
];

export const ExamConfigPanel: React.FC<ExamConfigPanelProps> = ({ params, onChange }) => {
  const handleTypeToggle = (type: ExamQuestionType) => {
    const newTypes = params.types.includes(type)
      ? params.types.filter((t) => t !== type)
      : [...params.types, type];
    onChange({ ...params, types: newTypes });
  };

  return (
    <div className="p-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex flex-col gap-4 font-inter text-gray-800 dark:text-gray-200">
      <h2 className="text-xl font-semibold mb-2">Sınav Yapılandırması</h2>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Sınıf Seviyesi (4-9)</label>
        <input
          type="number"
          min={4}
          max={9}
          className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
          value={params.gradeLevel}
          onChange={(e) => onChange({ ...params, gradeLevel: Number(e.target.value) })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Ünite / Konu</label>
        <input
          type="text"
          className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
          value={params.unit}
          onChange={(e) => onChange({ ...params, unit: e.target.value })}
          placeholder="Örn: Sözcükte Anlam"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Zorluk</label>
        <select
          className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
          value={params.difficulty}
          onChange={(e) =>
            onChange({ ...params, difficulty: e.target.value as 'Kolay' | 'Orta' | 'Zor' })
          }
        >
          <option value="Kolay">Kolay</option>
          <option value="Orta">Orta</option>
          <option value="Zor">Zor</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Soru Sayısı</label>
        <input
          type="number"
          min={1}
          max={50}
          className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
          value={params.questionCount}
          onChange={(e) => onChange({ ...params, questionCount: Number(e.target.value) })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Soru Tipleri</label>
        <div className="flex flex-col gap-1">
          {QUESTION_TYPES.map((qt) => (
            <label key={qt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={params.types.includes(qt.value)}
                onChange={() => handleTypeToggle(qt.value)}
                className="rounded border-gray-300"
              />
              <span>{qt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
