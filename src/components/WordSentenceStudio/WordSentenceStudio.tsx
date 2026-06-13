
import React, { useState } from 'react';
import { 
  generateFillBlanks, 
  generateMultipleChoiceVerbal, 
  generateWordCompletion, 
  generateMixedSentence, 
  generateAntonyms 
} from '../../services/generators/wordSentenceStudio.js';
import { 
  FillBlanksRenderer, 
  MultipleChoiceVerbalRenderer, 
  WordCompletionRenderer, 
  MixedSentenceRenderer, 
  AntonymRenderer 
} from './WordSentenceStudioComponents.js';
import { useUIStore } from '../../store/useUIStore.js';
import { useAppStore } from '../../store/useAppStore.js';
import { logError } from '../../utils/logger.js';
import { toAppError } from '../../utils/AppError.js';

type StudioFormat = 'fill_blanks' | 'multiple_choice' | 'word_completion' | 'mixed_sentence' | 'antonyms';

export const WordSentenceStudio: React.FC = () => {
  const [activeFormat, setActiveFormat] = useState<StudioFormat>('fill_blanks');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { updateStyleSettings } = useUIStore();
  const currentStudent = (useAppStore() as any).currentStudent;

  const handleGenerate = async () => {
    setIsLoading(true);
    const config = {
      studentName: currentStudent?.name || 'Öğrenci',
      topic: 'Genel Kültür ve Günlük Yaşam',
      difficulty: 'orta' as const,
      ageGroup: '8-10' as const,
      gradeLevel: currentStudent?.grade || 3,
      itemCount: 12
    };

    try {
      let result;
      switch (activeFormat) {
        case 'fill_blanks': result = await generateFillBlanks(config); break;
        case 'multiple_choice': result = await generateMultipleChoiceVerbal(config); break;
        case 'word_completion': result = await generateWordCompletion(config); break;
        case 'mixed_sentence': result = await generateMixedSentence(config); break;
        case 'antonyms': result = await generateAntonyms(config); break;
      }
      setData(result);
    } catch (error) {
      logError(toAppError(error), { context: 'Üretim hatası' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Yan Panel - Ayarlar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col p-6 shadow-xl z-10">
        <div className="mb-8">
           <h1 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">KELİME-CÜMLE</h1>
           <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Ultra-Premium Stüdyo</p>
        </div>

        <div className="space-y-2 mb-8">
          <label className="text-xs font-black text-gray-400 uppercase ml-1">Format Seçimi</label>
          {[
            { id: 'fill_blanks', label: '📑 Boşluk Doldurma', color: 'bg-blue-500' },
            { id: 'multiple_choice', label: '🔘 Çoktan Seçmeli', color: 'bg-emerald-500' },
            { id: 'word_completion', label: '🧩 Kelime Tamamlama', color: 'bg-amber-500' },
            { id: 'mixed_sentence', label: '🔀 Karışık Cümle', color: 'bg-rose-500' },
            { id: 'antonyms', label: '↔️ Zıt Anlamlar', color: 'bg-indigo-500' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => { setActiveFormat(f.id as StudioFormat); setData(null); }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all font-bold text-sm ${activeFormat === f.id ? 'bg-gray-900 text-white shadow-lg translate-x-2' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
            >
              <span className={`w-2 h-2 rounded-full ${f.color}`}></span>
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-4 rounded-2xl font-black shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
        >
          {isLoading ? (
             <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
          ) : (
            <>✨ YENİ İÇERİK ÜRET</>
          )}
        </button>

        <div className="mt-auto pt-6 border-t border-gray-100">
           <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">A4 Optimizasyonu</p>
              <div className="flex items-center justify-between">
                 <span className="text-xs font-bold text-gray-600">Maksimum Soru</span>
                 <div className="w-8 h-4 bg-accent/20 rounded-full relative">
                    <div className="absolute right-1 top-0.5 w-3 h-3 bg-accent rounded-full"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Ana Canvas - A4 Önizleme */}
      <div className="flex-1 overflow-y-auto p-12 bg-gray-100 custom-scrollbar scroll-smooth">
        <div className="max-w-[210mm] mx-auto bg-white shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/5 min-h-[297mm] transition-all duration-700 relative overflow-hidden rounded-[2px]">
          {data ? (
            <div className="p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeFormat === 'fill_blanks' && <FillBlanksRenderer data={data} />}
              {activeFormat === 'multiple_choice' && <MultipleChoiceVerbalRenderer data={data} />}
              {activeFormat === 'word_completion' && <WordCompletionRenderer data={data} />}
              {activeFormat === 'mixed_sentence' && <MixedSentenceRenderer data={data} />}
              {activeFormat === 'antonyms' && <AntonymRenderer data={data} />}
              
              {data.pedagogicalNote && (
                <div className="mt-12 pt-8 border-t border-gray-100 border-dashed">
                  <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-2 tracking-widest">DİSLEKSİ MÜDAHALE ANALİZİ (ÖĞRETMEN NOTU)</h4>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium italic">
                       {data.pedagogicalNote}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[297mm] opacity-20 filter grayscale">
               <div className="text-9xl mb-8 opacity-10">📄</div>
               <p className="text-xl font-black text-gray-400 uppercase tracking-tighter">Henüz içerik üretilmedi</p>
               <p className="text-sm font-bold text-gray-300">Sol paneldeki buton ile sihirli bir başlangıç yap!</p>
            </div>
          )}

          {/* A4 Kağıt Dokusu ve Kenarlıklar */}
          <div className="absolute inset-0 pointer-events-none border-[12mm] border-transparent print:border-none"></div>
        </div>
      </div>
    </div>
  );
};
