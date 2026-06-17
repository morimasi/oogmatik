import React from 'react';
import { ReadingSudokuData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const ReadingSudokuSheet = ({ data }: { data: ReadingSudokuData }) => {
  const size = data.settings.size || 4;
  const isBig = size > 4;
  const symbols = data.symbols || [];

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
        <div className="flex items-center gap-2 print:gap-1">
          {symbols.map((sym, idx) => (
            <div
              key={idx}
              className={`
                border border-zinc-300 flex items-center justify-center rounded-md
                ${isBig ? 'w-12 h-12' : 'w-20 h-20'}
              `}
              style={{ fontFamily: data.settings.fontFamily }}
            >
              {sym.imagePrompt ? (
                <span className="font-black text-zinc-500 text-sm">{sym.value}</span>
              ) : (
                <span className={`
                  font-black text-zinc-600 select-none
                  ${isBig ? 'text-base' : 'text-2xl'}
                `}>
                  {sym.value}
                </span>
              )}
            </div>
          ))}
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
