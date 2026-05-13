import React from 'react';
import { GeneratorOptions } from '../../types';
import { CompactToggleGroup } from './SharedConfigComponents';

interface VisualInterpretationConfigProps {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: any) => void;
}

export const VisualInterpretationConfig: React.FC<VisualInterpretationConfigProps> = ({
  options,
  onChange,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* TEMEL AYARLAR */}
      <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-[2rem] border border-violet-100 dark:border-violet-800/30 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <i className="fa-solid fa-circle-info text-violet-500 text-sm"></i>
          <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">Temel Ayarlar</span>
        </div>
        
        <div>
          <label className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2 block">Görsel Konusu / Tema</label>
          <select
            value={options.topic || 'daily_life'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('topic', e.target.value)}
            className="w-full p-4 bg-white dark:bg-zinc-800 border-2 border-violet-100 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-violet-500 dark:text-zinc-100"
          >
            <option value="daily_life">Günlük Yaşam (Ev, Okul, Park)</option>
            <option value="nature">Doğa ve Hayvanlar</option>
            <option value="city">Şehir ve Trafik</option>
            <option value="fantasy">Masal ve Fantastik</option>
            <option value="sports">Spor ve Hareket</option>
            <option value="emotions">Duygular ve İfadeler</option>
            <option value="jobs">Meslekler ve İş Yerleri</option>
            <option value="abstract">Soyut ve Desenler</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Zorluk</label>
            <select
              value={options.difficulty || 'Orta'}
              onChange={(e) => onChange('difficulty', e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-xs font-bold"
            >
              <option value="çok kolay">Çok Kolay</option>
              <option value="kolay">Kolay</option>
              <option value="Orta">Orta</option>
              <option value="Zor">Zor</option>
              <option value="uzman">Uzman</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Yaş</label>
            <select
              value={options.ageGroup || '8-10'}
              onChange={(e) => onChange('ageGroup', e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-xs font-bold"
            >
              <option value="5-7">5-7</option>
              <option value="8-10">8-10</option>
              <option value="11-13">11-13</option>
              <option value="14+">14+</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Sınıf</label>
            <select
              value={options.gradeLevel || 3}
              onChange={(e) => onChange('gradeLevel', parseInt(e.target.value))}
              className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-xs font-bold"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(grade => (
                <option key={grade} value={grade}>{grade}. Sınıf</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ÜRETİM MODU */}
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <i className="fa-solid fa-bolt text-indigo-500 text-sm"></i>
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Üretim Modu</span>
        </div>
        <CompactToggleGroup
          label="Mod Seçimi"
          selected={options.mode || 'ai'}
          onChange={(v: string) => onChange('mode', v)}
          options={[
            { value: 'fast', label: 'Hızlı' },
            { value: 'ai', label: 'AI' }
          ]}
        />
      </div>

      {/* GÖRSEL VE SORU AYARLARI */}
      <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-image text-violet-500 text-sm"></i>
          <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">Görsel Ayarları</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Görsel Stili</label>
            <select
              value={options.visualStyle || 'illustration'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('visualStyle', e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
            >
              <option value="illustration">Çizim (İllüstrasyon)</option>
              <option value="cartoon">Karikatür</option>
              <option value="diagram">Diyagram</option>
              <option value="photo_realistic">Gerçekçi</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Görsel Karmaşıklığı</label>
            <select
              value={options.visualComplexityLevel || 'medium'}
              onChange={(e) => onChange('visualComplexityLevel', e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
            >
              <option value="simple">Basit</option>
              <option value="medium">Orta</option>
              <option value="complex">Karmaşık</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-question-circle text-emerald-500 text-sm"></i>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Soru Ayarları</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase block">Soru Tipi</label>
              <select
                value={options.visualInterpretationStyle || 'mixed'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('visualInterpretationStyle', e.target.value as any)}
                className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
              >
                <option value="mixed">Karışık (Önerilen)</option>
                <option value="true_false">Doğru / Yanlış</option>
                <option value="multiple_choice">Çoktan Seçmeli</option>
                <option value="open_ended">Açık Uçlu</option>
                <option value="5n1k">5N 1K</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase block">Soru Sayısı</label>
              <input
                type="number"
                min="3"
                max="15"
                value={options.itemCountVisual || 5}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('itemCountVisual', parseInt(e.target.value))}
                className="w-full p-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-[10px] font-bold"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'includeDetailQuestions', label: 'Detay' },
              { key: 'includeInferentialVisualQuestions', label: 'Çıkarım' },
              { key: 'includeCreativeVisualQuestions', label: 'Yaratıcı' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-700 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                <input
                  type="checkbox"
                  checked={options[key as keyof GeneratorOptions] !== false}
                  onChange={(e) => onChange(key as keyof GeneratorOptions, e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 border-zinc-300"
                />
                <span className="text-[9px] font-bold text-zinc-600 dark:text-zinc-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-palette text-amber-500 text-sm"></i>
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Görsel & Düzen</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'generateImage', label: 'Görsel Üret' },
              { key: 'compactLayout', label: 'Kompakt Layout' },
              { key: 'useIcons', label: 'İkon Kullan' },
              { key: 'includeAnswerKey', label: 'Cevap Anahtarı' },
              { key: 'includeObservationNotes', label: 'Gözlem Notları' },
              { key: 'syllableColoring', label: 'Hece Renklendirme' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-700 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors border border-zinc-200 dark:border-zinc-600">
                <input
                  type="checkbox"
                  checked={options[key as keyof GeneratorOptions] !== false}
                  onChange={(e) => onChange(key as keyof GeneratorOptions, e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-zinc-300"
                />
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-[1.5rem] border border-violet-100 dark:border-violet-800/30">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-eye text-xs"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 uppercase tracking-tighter">
              Ultra Pro Görsel Analiz
            </span>
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400">
              Görsel algı ve yorumlama becerileri. Tamamen özelleştirilebilir.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
