import React, { useState } from 'react';
import { ExamConfigPanel } from './ExamConfigPanel';
import { ExamLayoutSettings } from './ExamLayoutSettings';
import { ExamPreview } from './ExamPreview';
import { ExamParams } from '../../services/generators/examGenerator';
import { ExamLayoutConfig, ExamQuestion } from '../../types/exam';
import { ExamActionBar } from './ExamActionBar';
import { printService } from '../../utils/printService';
import { useAuthStore } from '../../store/useAuthStore';
import { activityService } from '../../services/activityService';
import { logError } from '../../utils/logger';

export default function ExamStudio() {
  const { user } = useAuthStore();
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

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    // TODO: implement integration with examGenerator
    setTimeout(() => {
      // Mocked questions to demonstrate layout preview
      const mockQuestions: ExamQuestion[] = [
        {
          id: '1',
          type: 'multiple-choice',
          questionText: 'Aşağıdaki cümlelerin hangisinde mecaz anlamlı bir kelime kullanılmıştır?',
          bloomLevel: 'Kavrama',
          realLifeConnection: 'Günlük dilde duygu ifadeleri',
          solutionKey:
            '"Kara" kelimesi A, C ve D şıklarında gerçek (renk) anlamındayken, B şıkkında mecaz (kötü, uğursuz) anlamında kullanılmıştır.',
          options: {
            A: 'Kara bulutlar gökyüzünü kapladı.',
            B: 'Kara haber tez duyulur.',
            C: 'Kara tahtanın önünde bekledi.',
            D: 'Kömür karası gözleri vardı.',
          },
          correctOption: 'B',
        },
        {
          id: '2',
          type: 'true-false',
          questionText: '"Gözleri yollarda kalmak" deyimi çok beklemek anlamındadır.',
          bloomLevel: 'Bilgi',
          realLifeConnection: 'Deyimlerin anlamları',
          solutionKey:
            '"Gözleri yollarda kalmak" deyimi birini veya bir şeyi özlemle, merakla beklemek anlamına geldiği için ifade doğrudur.',
          isTrue: true,
        },
        {
          id: '3',
          type: 'fill-in-blanks',
          questionText: 'Eş sesli kelimelere ___ kelimeler de denir.',
          bloomLevel: 'Bilgi',
          realLifeConnection: 'Kavramların diğer adları',
          solutionKey:
            'Yazılışları aynı anlamları farklı olan kelimelere eş sesli (sesteş) kelimeler denir.',
          blankedText: 'Eş sesli kelimelere ___ kelimeler de denir.',
          correctWords: ['sesteş'],
        },
        {
          id: '4',
          type: 'open-ended',
          questionText: 'Okuduğunuz hikayenin ana fikrini kendi cümlelerinizle yazınız.',
          bloomLevel: 'Sentez',
          realLifeConnection: 'Okuduğunu anlama ve ifade etme',
          solutionKey:
            'Öğrencinin metnin genelinden çıkardığı dersi veya mesajı doğru bir şekilde ifade edip etmediği değerlendirilmelidir.',
          expectedKeywords: ['yardımlaşma', 'dayanışma', 'iyilik'],
        },
      ];
      setQuestions(mockQuestions);
      setIsLoading(false);
    }, 1000);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const examData = {
        type: 'EXAM',
        questions,
        params,
        layout,
      };
      await activityService.saveActivity(user.id, examData);
    } catch (e) {
      logError(e instanceof Error ? e : new Error('Save error'));
    }
  };

  const handlePrint = () => {
    printService.generatePdf('#exam-preview', 'sinav');
  };

  const handleDownload = () => {
    printService.generatePdf('#exam-preview', 'sinav', { action: 'download' });
  };

  const handleAddToWorkbook = () => {
    const examData = {
      type: 'EXAM',
      questions,
      params,
      layout,
    };
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

        {/* Right Area: Preview */}
        <div className="lg:col-span-2 min-h-[500px]">
          <div id="exam-preview">
            <ExamPreview questions={questions} layout={layout} />
          </div>
          <ExamActionBar
            onSave={handleSave}
            onPrint={handlePrint}
            onDownload={handleDownload}
            onAddToWorkbook={handleAddToWorkbook}
          />
        </div>
      </div>
    </div>
  );
}
