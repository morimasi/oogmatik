import React from 'react';
import { ReadingSudokuData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const ReadingSudokuSheet = ({ data }: { data: ReadingSudokuData }) => {
  const size = data.settings.size || 4;
  const isBig = size > 4;
  const symbols = data.symbols || [];

  const getSymbolColor = (idx: number) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-cyan-500 to-blue-600',
      'from-fuchsia-500 to-pink-600',
      'from-lime-500 to-green-600',
      'from-sky-500 to-indigo-600',
      'from-red-500 to-rose-600',
      'from-teal-500 to-cyan-600'
    ];
    return colors[idx % colors.length];
  };

  return (
    <div className="flex flex-col bg-white font-lexend text-black relative overflow-visible">
      <div className="px-6 pt-6 print:px-0 print:pt-0">
        <PedagogicalHeader
          title={data.title}
          instruction={data.instruction}
          note={data.pedagogicalNote}
        />
      </div>

      <div className="px-6 pb-6 print:px-0 print:pb-0 mt-6 print:mt-2 space-y-6 print:space-y-3">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl p-6 print:p-3 shadow-2xl border border-zinc-700/50">
          <div className="flex items-center gap-3 mb-5 print:mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-black">🎯</span>
            </div>
            <h5 className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-400">
              Sembol Havuzu
            </h5>
          </div>

          <div className={`grid ${symbols.length <= 4 ? 'grid-cols-4' : symbols.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'} gap-3 print:gap-1.5 max-w-xl`}>
            {symbols.map((sym, idx) => (
              <div
                key={idx}
                className="group relative"
              >
                <div className={`
                  aspect-square rounded-2xl flex items-center justify-center
                  bg-gradient-to-br ${getSymbolColor(idx)}
                  shadow-lg shadow-black/20 border border-white/10
                  transform transition-all duration-200 hover:scale-105 hover:shadow-xl
                  ${isBig ? 'p-1.5' : 'p-3'}
                `}>
                  {sym.imagePrompt ? (
                    <div className="w-full h-full flex items-center justify-center text-white text-lg">
                      <span>{sym.value}</span>
                    </div>
                  ) : (
                    <span className="text-white font-black tracking-tight select-none"
                      style={{
                        fontSize: isBig ? 'clamp(0.875rem, 2vw, 1.25rem)' : 'clamp(1rem, 2.5vw, 1.75rem)',
                        fontFamily: data.settings.fontFamily
                      }}>
                      {sym.value}
                    </span>
                  )}
                </div>
                {sym.label && sym.label !== sym.value && (
                  <span className="block text-center text-[8px] font-bold text-zinc-500 mt-1 truncate uppercase tracking-wide">
                    {sym.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="inline-block bg-gradient-to-br from-zinc-900 via-zinc-800 to-black rounded-2xl p-1.5 shadow-2xl border border-zinc-700/50">
            <div className="bg-white rounded-xl overflow-hidden">
              <table className="border-collapse">
                <tbody>
                  {data.grid.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => {
                        const isRightEdge =
                          (cIdx + 1) % (size === 4 ? 2 : 3) === 0 && cIdx !== size - 1;
                        const isBottomEdge =
                          (rIdx + 1) % (size === 9 ? 3 : 2) === 0 && rIdx !== size - 1;

                        return (
                          <td
                            key={cIdx}
                            className={`
                              text-center relative
                              border border-zinc-300
                              ${isBig ? 'w-12 h-12 text-base' : 'w-20 h-20 text-2xl'}
                              ${isRightEdge ? 'border-r-[3px] border-r-black' : ''}
                              ${isBottomEdge ? 'border-b-[3px] border-b-black' : ''}
                            `}
                          >
                            {cell ? (
                              <span className="font-black text-zinc-900 flex items-center justify-center w-full h-full"
                                style={{ fontFamily: data.settings.fontFamily }}>
                                <EditableText value={cell} tag="span" />
                              </span>
                            ) : (
                              <span className="flex items-center justify-center w-full h-full">
                                <span className="w-3 h-3 rounded-full bg-zinc-100 border border-zinc-200" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-50 to-white rounded-2xl border border-zinc-200 p-4 print:p-2 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-indigo-600 text-xs font-black">i</span>
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 leading-relaxed">
              Her satır, her sütun ve her kalın çizgili bölgede tüm semboller sadece <span className="text-indigo-600 font-black">BİR KEZ</span> kullanılmalıdır. Boş hücreleri sembollerle doldur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
