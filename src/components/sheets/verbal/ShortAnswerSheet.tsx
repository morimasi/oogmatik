import React from 'react';
import type { ShortAnswerData } from '../../../types/verbal';

interface ShortAnswerSheetProps {
  data: ShortAnswerData;
  compact?: boolean;
}

export const ShortAnswerSheet: React.FC<ShortAnswerSheetProps> = ({ data, compact = false }) => {
  const settings = data.settings;

  const getFontSize = () => {
    switch (settings?.fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-sm';
    }
  };

  const getLineHeight = () => {
    switch (settings?.lineHeight) {
      case 'tight': return 'leading-tight';
      case 'relaxed': return 'leading-relaxed';
      case 'very_relaxed': return 'leading-loose';
      default: return 'leading-normal';
    }
  };

  const getMarginSize = () => {
    switch (settings?.marginSize) {
      case 'narrow': return 'p-6';
      case 'wide': return 'p-16';
      default: return 'p-10';
    }
  };

  const getLineBorder = () => {
    const style = settings?.lineStyle || 'single';
    const color = settings?.lineColor || 'standard';
    
    let borderStyle = 'border-b';
    let borderWidth = 'border-b';
    
    switch (style) {
      case 'double': borderStyle = 'border-b-2 border-b-double'; break;
      case 'dotted': borderStyle = 'border-b border-b-dotted'; break;
      case 'dashed': borderStyle = 'border-b border-b-dashed'; break;
    }
    
    let borderColor = 'border-zinc-400';
    switch (color) {
      case 'light': borderColor = 'border-zinc-300'; break;
      case 'dark': borderColor = 'border-zinc-700'; break;
      case 'blue': borderColor = 'border-blue-500'; break;
      case 'green': borderColor = 'border-emerald-500'; break;
      case 'red': borderColor = 'border-rose-500'; break;
    }
    
    return `${borderStyle} ${borderColor}`;
  };

  const getColorTheme = () => {
    switch (settings?.colorTheme) {
      case 'blue': return { primary: 'text-blue-700', accent: 'bg-blue-50', border: 'border-blue-200' };
      case 'green': return { primary: 'text-emerald-700', accent: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'purple': return { primary: 'text-purple-700', accent: 'bg-purple-50', border: 'border-purple-200' };
      case 'amber': return { primary: 'text-amber-700', accent: 'bg-amber-50', border: 'border-amber-200' };
      default: return { primary: 'text-zinc-800', accent: 'bg-zinc-50', border: 'border-zinc-200' };
    }
  };

  const theme = getColorTheme();

  const exampleQuestions = data.questions?.length > 0 ? data.questions : [
    { id: 'q1', question: '1. Kendi adınızı ve soyadınızı yazın.', lines: 2, points: 5 },
    { id: 'q2', question: '2. En sevdiğiniz hayvan hangisidir? Nedenini kısaca açıklayın.', lines: 3, points: 10 },
    { id: 'q3', question: '3. Bugün hava nasıl? Bir cümle ile anlatın.', lines: 2, points: 5 },
    { id: 'q4', question: '4. Okulda en sevdiğiniz ders hangisidir?', lines: 1, points: 3 },
    { id: 'q5', question: '5. Hafta sonu ne yapmak istersiniz?', lines: 2, points: 8 },
    { id: 'q6', question: '6. En sevdiğiniz rengi yazın ve bir nesne çizin.', lines: 1, points: 4 },
    { id: 'q7', question: '7. Bir arkadaşınıza nasıl yardım edersiniz?', lines: 3, points: 10 },
    { id: 'q8', question: '8. En sevdiğiniz meyve nedir?', lines: 1, points: 3 },
    { id: 'q9', question: '9. Evde en sevdiğiniz yer neresidir? Neden?', lines: 2, points: 8 },
    { id: 'q10', question: '10. Gelecekte ne olmak istiyorsunuz? Açıklayın.', lines: 4, points: 12 },
    { id: 'q11', question: '11. En sevdiğiniz oyun hangisidir?', lines: 1, points: 3 },
    { id: 'q12', question: '12. Doğayı sevmek için ne yapmalıyız?', lines: 2, points: 8 },
    { id: 'q13', question: '13. Bugün ne yedin?', lines: 1, points: 3 },
    { id: 'q14', question: '14. Ailenizle en sevdiğiniz aktivite nedir?', lines: 2, points: 8 },
    { id: 'q15', question: '15. Kış mevsiminde ne giyersiniz?', lines: 2, points: 7 },
    { id: 'q16', question: '16. En sevdiğiniz kitabın adını yazın.', lines: 1, points: 3 },
  ];

  return (
    <div className={`
      w-full bg-white
      ${getMarginSize()}
      font-["Lexend"]
      ${compact ? 'max-w-4xl mx-auto' : ''}
    `}>
      {/* Başlık Bölümü */}
      <div className={`text-center mb-8 pb-6 border-b-2 ${theme.border}`}>
        <h1 className={`
          font-black mb-2
          ${compact ? 'text-2xl' : 'text-3xl'}
          ${theme.primary}
        `}>
          {data.content?.title || 'KISA CEVAPLI SORULAR'}
        </h1>
        
        {data.content?.subtitle && (
          <h2 className="text-sm font-semibold text-zinc-500 mb-2">
            {data.content.subtitle}
          </h2>
        )}

        {data.content?.instruction && (
          <p className={`
            text-zinc-600
            ${compact ? 'text-xs' : 'text-sm'}
            italic
          `}>
            {data.content.instruction}
          </p>
        )}

        <div className="flex justify-center gap-6 mt-4">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            {settings?.ageGroup === 'okul_oncesi' ? 'OKUL ÖNCESİ' : `${settings?.ageGroup || '8-10'} YAŞ`}
          </span>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            {settings?.difficulty || 'ORTA'} SEVİYE
          </span>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            {settings?.gradeLevel === 0 ? 'OKUL ÖNCESİ' : `${settings?.gradeLevel || 3}. SINIF`}
          </span>
        </div>
      </div>

      {/* Etkinlik İçeriği - İki Sütunlu */}
      <div className={`
        ${settings?.columnLayout === 'two-column' 
          ? 'grid grid-cols-2 gap-x-8 gap-y-6' 
          : 'space-y-5'}
      `}>
        {exampleQuestions.map((q, index) => (
          <div 
            key={q.id} 
            className={`
              space-y-2
              ${settings?.showBorders ? `p-3 rounded-xl ${theme.accent} border ${theme.border}` : ''}
            `}
          >
            <div className="flex justify-between items-start gap-2">
              <p className={`
                font-bold text-zinc-800
                ${getFontSize()}
                ${getLineHeight()}
                flex-1
              `}>
                {q.question}
              </p>
              
              {settings?.includePoints !== false && q.points && (
                <span className={`
                  text-[10px] font-black px-2 py-0.5 rounded-full
                  ${theme.accent} ${theme.primary}
                `}>
                  {q.points}p
                </span>
              )}
            </div>
            
            {/* Cevap Satırları */}
            {settings?.includeAnswerLines !== false && Array.from({ 
              length: q.lines || settings?.answerLineCount || 2 
            }).map((_, lineIndex) => (
              <div 
                key={`${q.id}-line-${lineIndex}`} 
                className={`
                  w-full py-1.5
                  ${getLineBorder()}
                `}
              />
            ))}
            
            {/* İpucu */}
            {settings?.includeHints && q.hint && (
              <p className={`
                text-[10px] italic
                ${theme.primary}
              `}>
                <i className="fa-solid fa-lightbulb mr-1"></i>
                {q.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pedagojik Not */}
      {data.pedagogicalNote && (
        <div className={`
          mt-8 p-4 rounded-xl
          ${theme.accent} border ${theme.border}
        `}>
          <p className={`
            text-[10px] font-bold leading-relaxed
            ${theme.primary}
          `}>
            <i className="fa-solid fa-graduation-cap mr-2"></i>
            <strong>ÖĞRETMENE NOT:</strong> {data.pedagogicalNote}
          </p>
        </div>
      )}

      {/* Alt Bilgi */}
      <div className="mt-8 pt-4 border-t border-zinc-200 flex justify-between items-center">
        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">
          OOGMATIK
        </p>
        <p className="text-[9px] text-zinc-400">
          <i className="fa-solid fa-pen-to-square mr-1"></i>
          Kısa Cevaplı Sorular
        </p>
      </div>
    </div>
  );
};
