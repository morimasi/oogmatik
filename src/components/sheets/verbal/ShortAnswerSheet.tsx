import React from 'react';
import type { ShortAnswerData } from '../../../types/verbal';

interface ShortAnswerSheetProps {
  data: ShortAnswerData;
  compact?: boolean;
}

export const ShortAnswerSheet: React.FC<ShortAnswerSheetProps> = ({ data, compact = false }) => {
  const settings = data.settings;
  const fontSize = settings?.fontSize === 'small' ? 'text-sm' : settings?.fontSize === 'large' ? 'text-xl' : 'text-base';
  const lineHeight = settings?.lineHeight === 'tight' ? 'leading-snug' : settings?.lineHeight === 'relaxed' ? 'leading-relaxed' : 'leading-normal';
  const columnLayout = settings?.columnLayout === 'two-column' ? 'grid grid-cols-2 gap-8' : 'space-y-6';

  const getLineStyle = () => {
    switch (settings?.lineStyle) {
      case 'double': return 'border-b-2 border-b-zinc-800';
      case 'dotted': return 'border-b-2 border-b-dotted border-b-zinc-500';
      case 'dashed': return 'border-b-2 border-b-dashed border-b-zinc-500';
      default: return 'border-b border-b-zinc-700';
    }
  };

  const getLineColor = () => {
    switch (settings?.lineColor) {
      case 'dark': return 'border-b-zinc-800';
      case 'light': return 'border-b-zinc-300';
      default: return 'border-b-zinc-500';
    }
  };

  const exampleQuestions = data.questions?.length > 0 ? data.questions : [
    { id: 'q1', question: '1. Kendi adınızı yazın.', lines: 2 },
    { id: 'q2', question: '2. En sevdiğiniz hayvan nedir? Neden?', lines: 3 },
    { id: 'q3', question: '3. Bugün hava nasıl?', lines: 2 },
    { id: 'q4', question: '4. Okulda en sevdiğiniz ders hangisi?', lines: 2 },
    { id: 'q5', question: '5. Hafta sonu ne yapmak istersiniz?', lines: 3 },
    { id: 'q6', question: '6. En sevdiğiniz renk nedir?', lines: 1 },
    { id: 'q7', question: '7. Bir arkadaşınıza nasıl yardım edersiniz?', lines: 3 },
    { id: 'q8', question: '8. En sevdiğiniz meyve nedir?', lines: 1 },
    { id: 'q9', question: '9. Evde en sevdiğiniz yer neresidir?', lines: 2 },
    { id: 'q10', question: '10. Gelecekte ne olmak istiyorsunuz?', lines: 4 },
  ];

  return (
    <div className={`
      w-full bg-white
      ${compact ? 'p-6' : 'p-12'}
      font-["Lexend"]
    `}>
      {/* Başlık */}
      <div className="text-center mb-10">
        <h1 className={`
          font-black mb-3
          ${compact ? 'text-2xl' : 'text-4xl'}
          text-amber-600
        `}>
          {data.content?.title || 'KISA CEVAPLI SORULAR'}
        </h1>
        {data.content?.instruction && (
          <p className={`
            text-zinc-600
            ${compact ? 'text-sm' : 'text-lg'}
            italic
          `}>
            {data.content.instruction}
          </p>
        )}
        <div className="mt-4 border-t-2 border-amber-500/30 pt-4">
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
            {settings?.ageGroup || '8-10'} YAŞ | {settings?.difficulty || 'Orta'} SEVİYE | {settings?.gradeLevel || 3}. SINIF
          </p>
        </div>
      </div>

      {/* Etkinlik İçeriği */}
      <div className={columnLayout}>
        {exampleQuestions.map((q, index) => (
          <div key={q.id} className="space-y-3">
            <p className={`
              font-bold text-zinc-800
              ${fontSize}
              ${lineHeight}
            `}>
              {q.question}
            </p>
            
            {/* Cevap Satırları */}
            {settings?.includeAnswerLines !== false && Array.from({ length: q.lines || settings?.answerLineCount || 2 }).map((_, lineIndex) => (
              <div 
                key={`${q.id}-line-${lineIndex}`} 
                className={`
                  w-full py-2
                  ${getLineStyle()}
                  ${getLineColor()}
                `}
              />
            ))}
            
            {/* İpucu */}
            {settings?.includeHints && q.hint && (
              <p className="text-xs text-amber-600 italic">
                <i className="fa-solid fa-lightbulb mr-1.5"></i>
                {q.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pedagojik Not */}
      {data.pedagogicalNote && (
        <div className="mt-12 p-6 bg-indigo-50/70 rounded-2xl border border-indigo-500/20">
          <p className="text-xs font-bold text-indigo-800 leading-relaxed">
            <i className="fa-solid fa-graduation-cap mr-2"></i>
            <strong>ÖĞRETMENE NOT:</strong> {data.pedagogicalNote}
          </p>
        </div>
      )}

      {/* Alt Bilgi */}
      <div className="mt-10 pt-6 border-t border-zinc-200 flex justify-between items-center">
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          OOGMATIK ÖZEL EĞİTİM TEKNOLOJİLERİ
        </p>
        <p className="text-[10px] text-zinc-400">
          <i className="fa-solid fa-pen-to-square mr-1"></i>
          Kısa Cevaplı Sorular Modülü
        </p>
      </div>
    </div>
  );
};
