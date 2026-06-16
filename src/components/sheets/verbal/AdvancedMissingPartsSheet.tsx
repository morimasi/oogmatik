import React from 'react';
import { MissingPartsData } from '../../../types';

const getBlankStyle = (settings: MissingPartsData['settings']) => {
  const sizeStyles: Record<string, string> = {
    small: 'min-w-[50px] inline-block mx-0.5',
    medium: 'min-w-[80px] inline-block mx-1',
    large: 'min-w-[120px] inline-block mx-1.5'
  };
  const borderStyles: Record<string, string> = {
    underline: 'border-b-2 border-zinc-800',
    dashed: 'border-b-2 border-dashed border-zinc-600',
    solid: 'border-b-4 border-zinc-900',
    dotted: 'border-b-2 border-dotted border-zinc-500'
  };
  return `${sizeStyles[settings?.blankSize || 'medium']} ${borderStyles[settings?.blankStyle || 'underline']}`;
};

export const AdvancedMissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => {
  const { content, settings } = data;
  const paragraphs = Array.isArray(content?.paragraphs) ? content.paragraphs : [];
  const wordBank = content?.wordBank;
  const compact = settings?.compactLayout !== false;

  return (
    <div className="flex flex-col w-full bg-white font-lexend text-black relative overflow-hidden">
      {/* Premium Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-white">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xs font-black text-zinc-900 leading-tight truncate">{content?.title || data.title || 'Eksik Parçaları Tamamlama'}</h1>
            <p className="text-[8px] text-zinc-500 leading-tight truncate">{content?.instruction || data.instruction || 'Boşlukları uygun kelimelerle doldurun.'}</p>
          </div>
        </div>
        {settings?.fastMode && (
          <span className="text-[7px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0 leading-none">
            ⚡ Hızlı
          </span>
        )}
      </div>

      {data.pedagogicalNote && (
        <div className="mx-1.5 mt-1 mb-0.5 p-1 bg-amber-50 rounded border border-amber-100 print:hidden">
          <p className="text-[7px] text-amber-700 leading-tight">
            <span className="font-black">Not:</span> {data.pedagogicalNote}
          </p>
        </div>
      )}

      {/* Word Bank */}
      {wordBank && Array.isArray(wordBank.words) && wordBank.words.length > 0 && (
        <div className={`mx-1.5 mb-1 p-1.5 bg-zinc-900 rounded-lg border border-zinc-700 ${compact ? 'p-1' : 'p-2'}`}>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[7px] font-black text-emerald-400 uppercase tracking-wider">Kelime Havuzu</span>
            <span className="text-[6px] text-zinc-500">({wordBank.words.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {wordBank.words.map((word, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-white/10 text-white text-[9px] font-bold rounded border border-white/10">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-1.5 py-1 print:py-0.5">
        <div className={`space-y-2 ${compact ? 'space-y-1.5' : 'space-y-3'}`}>
          {paragraphs.map((paragraph, pIdx) => (
            <div key={paragraph.id || pIdx} className={`relative ${compact ? 'p-1.5' : 'p-3'} bg-zinc-50/30 rounded-lg border border-zinc-100`}>
              {settings?.showParagraphNumbers !== false && (
                <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded text-[6px] font-black uppercase leading-none shadow">
                  {pIdx + 1}
                </span>
              )}
              <p className={`text-justify text-zinc-800 leading-relaxed ${compact ? 'text-xs leading-snug' : 'text-sm'}`}>
                {paragraph?.parts?.map((part, iIdx) => (
                  part.isBlank ? (
                    <span key={iIdx} className={`${getBlankStyle(settings)} align-middle`}>
                      <span className="text-zinc-400 text-[8px] font-medium">[___]</span>
                    </span>
                  ) : (
                    <span key={iIdx}>{part.text}</span>
                  )
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Footer */}
      <div className="mt-auto border-t border-zinc-300 mx-1.5 pt-1 pb-1 print:pt-0.5 print:pb-0.5 break-inside-avoid">
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'SÜRE', cls: 'bg-zinc-50 border-zinc-200 text-zinc-400' },
            { label: 'DOĞRU', cls: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
            { label: 'YANLIŞ', cls: 'bg-red-50 border-red-200 text-red-500' },
            { label: 'PUAN', cls: 'bg-indigo-600 border-indigo-700 text-white' },
          ].map(({ label, cls }) => (
            <div key={label} className={`p-1 rounded-lg border ${cls}`}>
              <p className="text-[6px] font-black uppercase tracking-wider mb-0.5">{label}</p>
              <div className="h-4 border-b border-dashed opacity-40" style={{ borderColor: 'currentColor' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
