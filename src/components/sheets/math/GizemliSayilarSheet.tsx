import React from 'react';
import { ActivityType } from '../../../types/activity';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

interface GizemliSayilarData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  riddles: {
    id: string;
    mysteryNumber: number;
    clues: { id: string; text: string; type: string }[];
  }[];
  settings: Record<string, unknown>;
}

import React from 'react';
import { NumberLogicRiddleData } from '../../../types/math';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const GizemliSayilarSheet: React.FC<{ data: NumberLogicRiddleData }> = ({ data }) => {
  const puzzles = data.puzzles || [];
  const settings = data.settings || {};
  const aestheticMode = settings.aestheticMode || 'standard';
  const showIcons = settings.showIcons !== false;

  const themeStyles: Record<string, { bg: string; card: string; accent: string; textColor: string; iconColor: string }> = {
    standard: {
      bg: 'bg-white',
      card: 'bg-zinc-50 border-zinc-100',
      accent: 'bg-indigo-500',
      textColor: 'text-zinc-800',
      iconColor: 'text-indigo-600'
    },
    detective: {
      bg: 'bg-stone-50',
      card: 'bg-stone-100/50 border-stone-200',
      accent: 'bg-amber-700',
      textColor: 'text-stone-900',
      iconColor: 'text-amber-800'
    },
    neon: {
      bg: 'bg-slate-900',
      card: 'bg-slate-800/40 border-indigo-500/30',
      accent: 'bg-fuchsia-500',
      textColor: 'text-white',
      iconColor: 'text-cyan-400'
    },
    cyber: {
      bg: 'bg-zinc-950',
      card: 'bg-zinc-900 border-emerald-500/20',
      accent: 'bg-emerald-500',
      textColor: 'text-emerald-50',
      iconColor: 'text-emerald-400'
    }
  };

  const style = themeStyles[aestheticMode] || themeStyles.standard;
  
  // Choose layout based on number of puzzles
  const getGridClass = () => {
    if (puzzles.length >= 8) return 'grid grid-cols-2 gap-4 mt-6';
    if (puzzles.length >= 6) return 'grid grid-cols-2 gap-6 mt-6';
    return 'grid grid-cols-1 md:grid-cols-2 gap-8 mt-8';
  };

  return (
    <div className={`flex flex-col ${style.bg} p-8 ${style.textColor} font-lexend min-h-[1123px] transition-colors duration-500`}>
      <PedagogicalHeader
        title={data.title || 'Gizemli Sayılar'}
        instruction={data.instruction || 'İpuçlarını dikkatlice oku ve her kutudaki gizemli sayıyı bul!'}
        data={data}
      />

      <div className={getGridClass()}>
        {puzzles.map((puzzle, index) => (
          <div key={puzzle.id} className={`flex flex-col ${style.card} rounded-[2rem] border-2 p-6 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
            {/* Index Badge */}
            <div className={`absolute top-0 left-0 w-12 h-12 ${style.accent} text-white flex items-center justify-center font-black text-lg rounded-br-[1.5rem] shadow-lg`}>
              #{index + 1}
            </div>

            {/* Visual Distraction Layer */}
            {puzzle.visualDistraction && puzzle.visualDistraction.length > 0 && (
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex flex-wrap gap-4 p-4 overflow-hidden">
                    {puzzle.visualDistraction.map((num, idx) => (
                        <span key={idx} className="text-4xl font-black">{num}</span>
                    ))}
                </div>
            )}
            
            <div className="flex-1 space-y-4 mt-8 relative z-10">
              {(puzzle.riddleParts || []).map((part, cIdx) => (
                <div key={cIdx} className="flex items-start gap-4">
                  {showIcons && (
                      <div className={`w-8 h-8 ${aestheticMode === 'neon' || aestheticMode === 'cyber' ? 'bg-white/5' : 'bg-white'} rounded-xl shadow-sm border border-black/5 flex items-center justify-center shrink-0`}>
                        <i className={`fa-solid ${part.icon || 'fa-magnifying-glass'} ${style.iconColor} text-sm`}></i>
                      </div>
                  )}
                  <p className="text-[13px] font-bold leading-snug pt-1">
                    {part.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Options */}
            {puzzle.options && (
                <div className="mt-6 flex flex-wrap gap-2 justify-center relative z-10">
                    {puzzle.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`px-3 py-1 rounded-lg border-2 ${aestheticMode === 'neon' || aestheticMode === 'cyber' ? 'border-white/10 bg-white/5' : 'border-zinc-200 bg-white'} text-[10px] font-black opacity-40`}>
                            {opt}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 pt-4 border-t-2 border-dashed border-black/10 flex justify-between items-center relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Gizemli Sayı</span>
              <div className={`w-24 h-12 ${aestheticMode === 'neon' || aestheticMode === 'cyber' ? 'bg-white/5' : 'bg-white'} border-2 ${style.accent.replace('bg-', 'border-')} rounded-2xl flex items-center justify-center shadow-inner`}>
                <span className={`${style.iconColor} font-black text-xl`}>?</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-black/5 flex justify-between items-center opacity-30">
        <div className="flex items-center gap-3">
          <i className={`fa-solid fa-user-secret text-2xl ${style.iconColor}`}></i>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest">Neuro-bdmind Sayısal Muhakeme</p>
            <p className="text-[8px] font-medium">Bilişsel Çıkarım ve Sayı Hissi Atölyesi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GizemliSayilarSheet;
