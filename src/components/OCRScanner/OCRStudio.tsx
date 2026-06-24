import React, { useState } from 'react';
import { Student } from '../../types';
import { DifficultyLevel } from './useOCRScanner';

interface StudentSelectorProps {
  students: Student[];
  activeStudent: Student | null;
  onSelect: (s: Student | null) => void;
}
export const StudentSelector = ({ students, activeStudent, onSelect }: StudentSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  if (students.length === 0) return null;
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all text-xs font-bold ${activeStudent
            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
          }`}
      >
        <i className={`fa-solid ${activeStudent ? 'fa-user-graduate' : 'fa-user-plus'}`}></i>
        {activeStudent ? activeStudent.name : 'Öğrenci Seç'}
        <i
          className={`fa-solid fa-chevron-down text-[8px] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        ></i>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-2 min-w-[220px] z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {activeStudent && (
            <button
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-xs font-medium text-red-400"
            >
              <i className="fa-solid fa-user-slash w-4 text-center"></i>Seçimi Kaldır
            </button>
          )}
          {students.map((s: Student) => (
            <button
              key={s.id}
              onClick={() => {
                onSelect(s);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-xs font-medium ${activeStudent?.id === s.id ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-300'}`}
            >
              <span className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px] font-black shrink-0">
                {s.avatar || s.name.charAt(0).toUpperCase()}
              </span>
              <div className="text-left">
                <div className="font-bold">{s.name}</div>
                <div className="text-[10px] text-slate-500">
                  {s.grade} • {s.learningStyle}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface DifficultyPickerProps {
  selected: DifficultyLevel;
  onChange: (d: DifficultyLevel) => void;
}
const DifficultyPicker = ({ selected, onChange }: DifficultyPickerProps) => {
  const levels: {
    value: DifficultyLevel;
    icon: string;
    color: string;
    bg: string;
    border: string;
  }[] = [
      {
        value: 'Başlangıç',
        icon: 'fa-seedling',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/40',
      },
      {
        value: 'Orta',
        icon: 'fa-bolt',
        color: 'text-amber-400',
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/40',
      },
      {
        value: 'Zor',
        icon: 'fa-fire',
        color: 'text-red-400',
        bg: 'bg-red-500/20',
        border: 'border-red-500/40',
      },
    ];
  return (
    <div className="flex gap-2">
      {levels.map(
        (l: {
          value: DifficultyLevel;
          icon: string;
          color: string;
          bg: string;
          border: string;
        }) => (
          <button
            key={l.value}
            onClick={() => onChange(l.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${selected === l.value
                ? `${l.bg} ${l.border} ${l.color}`
                : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
              }`}
          >
            <i className={`fa-solid ${l.icon}`}></i>
            {l.value}
          </button>
        )
      )}
    </div>
  );
};

interface OCRStudioProps {
  images: string[];
  activeImageIndex: number;
  blueprintData: any;
  editedTitle: string;
  editedBlueprint: string;
  isEditingBlueprint: boolean;
  difficulty: DifficultyLevel;
  itemCount: number;
  variantCount: number;
  concept: string;
  variationCount: number;
  activeStudent: Student | null;
  students: Student[];
  onTitleChange: (title: string) => void;
  onBlueprintChange: (bp: string) => void;
  onToggleEditBlueprint: () => void;
  onDifficultyChange: (d: DifficultyLevel) => void;
  onItemCountChange: (count: number) => void;
  onVariantCountChange: (count: number) => void;
  onConceptChange: (concept: string) => void;
  onVariationCountChange: (count: number) => void;
  onAnalyzeImage: (index: number) => void;
  onBack: () => void;
  onGenerate: () => void;
  onGenerateVariations: () => void;
  onSelectStudent: (s: Student | null) => void;
  onAddFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFile: (e: any) => void;
}

export const OCRStudio = ({
  images,
  activeImageIndex,
  blueprintData,
  editedTitle,
  editedBlueprint,
  isEditingBlueprint,
  difficulty,
  itemCount,
  variantCount,
  concept,
  variationCount,
  activeStudent,
  students,
  onTitleChange,
  onBlueprintChange,
  onToggleEditBlueprint,
  onDifficultyChange,
  onItemCountChange,
  onVariantCountChange,
  onConceptChange,
  onVariationCountChange,
  onAnalyzeImage,
  onBack,
  onGenerate,
  onGenerateVariations,
  onSelectStudent,
  onAddFile,
  fileInputRef,
  handleFile,
}: OCRStudioProps) => {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-in slide-in-from-bottom-10 duration-700">
      <div className="space-y-4">
        <div className="bg-black/40 rounded-[3rem] border border-white/10 p-8 shadow-2xl overflow-hidden group relative">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">
            Referans Görsel
          </p>
          <img
            src={images[activeImageIndex]}
            className="w-full rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"
            alt="Source"
          />
          <div className="absolute inset-0 pointer-events-none border-[12px] border-black/20 rounded-[3rem]"></div>
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 px-4 overflow-x-auto custom-scrollbar pb-2">
            {images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => onAnalyzeImage(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activeImageIndex === i ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20' : 'border-white/10 opacity-50 hover:opacity-100'}`}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt={`Sayfa ${i + 1}`}
                />
              </button>
            ))}
            {images.length < 5 && (
              <button
                onClick={onAddFile}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-400/50 flex items-center justify-center shrink-0 text-slate-500 hover:text-indigo-400 transition-all"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="p-8 bg-zinc-900/50 rounded-[3rem] border border-white/10 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <i className="fa-solid fa-code text-9xl"></i>
          </div>
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="px-4 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-full text-[10px] font-black uppercase border border-emerald-500/30">
              MİMARİ DNA ANALİZ EDİLDİ
            </span>
            {blueprintData.detectedType && blueprintData.detectedType !== 'ARCH_CLONE' && (
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-[9px] font-black uppercase border border-indigo-500/20">
                {blueprintData.detectedType.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div className="group mb-4">
            <input
              type="text"
              value={editedTitle}
              onChange={(e: any) => onTitleChange(e.target.value)}
              className="w-full text-3xl font-black tracking-tighter bg-transparent border-b-2 border-transparent hover:border-white/10 focus:border-indigo-500 outline-none transition-all py-1 text-white placeholder-slate-600"
              placeholder="Başlık ekleyin..."
            />
            <p className="text-[9px] text-slate-600 mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fa-solid fa-pen-to-square mr-1"></i>Tıklayarak başlığı düzenleyin
            </p>
          </div>

          {blueprintData.layoutHints && (
            <div className="flex gap-2 mb-5 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400">
                <i className="fa-solid fa-table-columns text-indigo-400"></i>
                {blueprintData.layoutHints.columns} Sütun
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400">
                <i className="fa-solid fa-circle-question text-indigo-400"></i>~
                {blueprintData.layoutHints.questionCount} Soru
              </div>
              {blueprintData.layoutHints.hasImages && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400">
                  <i className="fa-solid fa-image text-indigo-400"></i>Görsel İçeriyor
                </div>
              )}
            </div>
          )}

          <div className="bg-black/40 rounded-3xl border border-white/5 mb-6 overflow-hidden">
            <div className="flex justify-between items-center px-5 py-3 border-b border-white/5">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Teknik Blueprint
              </h4>
              <button
                onClick={onToggleEditBlueprint}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isEditingBlueprint ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-slate-500 hover:text-white border border-white/10'}`}
              >
                <i
                  className={`fa-solid ${isEditingBlueprint ? 'fa-lock-open' : 'fa-pen'}`}
                ></i>
                {isEditingBlueprint ? 'Düzenleniyor' : 'Düzenle'}
              </button>
            </div>
            {isEditingBlueprint ? (
              <textarea
                value={editedBlueprint}
                onChange={(e: any) => onBlueprintChange(e.target.value)}
                className="w-full p-5 text-[11px] font-mono text-indigo-300 leading-relaxed bg-transparent resize-none outline-none custom-scrollbar min-h-[200px]"
                spellCheck={false}
              />
            ) : (
              <pre className="p-5 text-[11px] font-mono text-indigo-300 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                {editedBlueprint || blueprintData.worksheetBlueprint}
              </pre>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                Zorluk Seviyesi
              </label>
              <DifficultyPicker selected={difficulty} onChange={onDifficultyChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Soru/Öğe Sayısı
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={itemCount}
                  onChange={(e: any) => onItemCountChange(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Varyant Sayısı
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n: number) => (
                    <button
                      key={n}
                      onClick={() => onVariantCountChange(n)}
                      className={`flex-1 h-12 rounded-xl border font-black text-sm transition-all ${variantCount === n ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}
                    >
                      {n}×
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                Odaklanılacak Konu / Bağlam (Opsiyonel)
              </label>
              <textarea
                value={concept}
                onChange={(e: any) => onConceptChange(e.target.value)}
                placeholder="Örn: Hücrenin organelleri, kesirlerle toplama işlemi, Cumhuriyet dönemi..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-medium text-white placeholder-slate-600 focus:border-indigo-500 outline-none resize-none transition-all h-20 custom-scrollbar"
              />
            </div>
            {activeStudent && (
              <div className="flex items-center gap-3 p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-black">
                  {activeStudent.avatar || activeStudent.name.charAt(0).toUpperCase()}
                </span>
                <div className="text-left flex-1">
                  <p className="text-xs font-bold text-indigo-300">{activeStudent.name}</p>
                  <p className="text-[10px] text-indigo-400/60">
                    {activeStudent.grade} • {activeStudent.learningStyle}
                  </p>
                </div>
                <i className="fa-solid fa-user-check text-indigo-400/50 text-xs"></i>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-6">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                Varyasyon Sayısı (Yeni API)
              </label>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map((n: number) => (
                  <button
                    key={n}
                    onClick={() => onVariationCountChange(n)}
                    className={`flex-1 h-12 rounded-xl border font-black text-sm transition-all ${variationCount === n
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                        : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                      }`}
                  >
                    {n}×
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onGenerateVariations}
              className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-3xl hover:from-purple-700 hover:to-pink-700 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 text-sm group border-2 border-purple-400/20"
            >
              <i className="fa-solid fa-wand-magic-sparkles group-hover:rotate-12 transition-transform"></i>
              {variationCount} VARYASYON ÜRET (YENİ API)
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-black">
                BETA
              </span>
            </button>
          </div>

          <button
            onClick={onBack}
            className="w-full mt-4 py-3 text-slate-500 font-bold hover:text-white transition-colors text-sm uppercase tracking-widest"
          >
            Farklı Görsel Seç
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFile}
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,application/pdf"
        multiple
        className="hidden"
      />
    </div>
  );
};
