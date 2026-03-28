import React, { useState } from 'react';
import { ExamConfigPanel } from './ExamConfigPanel';
import { ExamLayoutSettings } from './ExamLayoutSettings';
import { ExamParams } from '../../services/generators/examGenerator';
import { ExamLayoutConfig } from '../../types/exam';

export default function ExamStudio() {
  const [params, setParams] = useState<ExamParams>({
    gradeLevel: 4,
    unit: '',
    difficulty: 'Orta',
    questionCount: 10,
    types: ['multiple-choice'],
  });

  const [layout, setLayout] = useState<ExamLayoutConfig>({
    grid: {
      cols: 2,
      gap: 8,
      padding: 16,
      borderStyle: 'solid',
    },
    visibility: {
      showTitle: true,
      showUnit: true,
      showStudentName: true,
      showObjective: true,
      showDate: true,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    // TODO: implement integration with examGenerator
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6 font-lexend">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Türkçe Sınav Stüdyosu (Bilgi Macerası)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: Controls */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <ExamConfigPanel params={params} onChange={setParams} />
          <ExamLayoutSettings layout={layout} onChange={setLayout} />
          <button
            onClick={handleGenerate}
            disabled={isLoading || params.types.length === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
          >
            {isLoading ? 'Sınav Üretiliyor...' : 'Sınav Oluştur'}
          </button>
        </div>

        {/* Right Area: Preview (Placeholder for Task 4) */}
        <div className="lg:col-span-2 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl min-h-[500px] bg-gray-50 dark:bg-gray-800/50">
          <p className="text-gray-500 dark:text-gray-400">
            Sınav önizlemesi burada görünecek (Task 4)
          </p>
        </div>
      </div>
    </div>
  );
}
