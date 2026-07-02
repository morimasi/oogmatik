import React from 'react';
import { ReadingSudokuData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const ReadingSudokuSheet = ({ data }: { data: ReadingSudokuData }) => {
  const size = data.settings.size || 4;
  const isBig = size > 4;
  const symbols = data.symbols || [];

  return (
    <div className="flex flex-col bg-white font-lexend text-black relative overflow-visible min-h-[297mm] p-3 print:p-2">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
      />

      <div className="mt-4 print:mt-2 space-y-4 print:space-y-2">
        <div className="flex items-center gap-2 print:gap-1 justify-center">
          {symbols.map((sym, idx) => (
            <div
              key={idx}
              className={`
                border border-zinc-400 flex items-center justify-center rounded-md
                ${isBig ? 'w-10 h-10' : 'w-14 h-14'}
              `}
              style={{ fontFamily: data.settings.fontFamily }}
            >
              {sym.imagePrompt ? (
                <span className="font-black text-zinc-600 text-xs">{sym.value}</span>
              ) : (
                <span className={`
                  font-black text-zinc-700 select-none
                  ${isBig ? 'text-sm' : 'text-xl'}
                `}>
                  {sym.value}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <div className="inline-block bg-zinc-800 rounded-xl p-1 shadow-lg border border-zinc-700">
            <div className="bg-white rounded-lg overflow-hidden">
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
                              ${isBig ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-xl'}
                              ${isRightEdge ? 'border-r-2 border-r-zinc-800' : ''}
                              ${isBottomEdge ? 'border-b-2 border-b-zinc-800' : ''}
                            `}
                          >
                            {cell ? (
                              <span className="font-black text-zinc-900 flex items-center justify-center w-full h-full"
                                style={{ fontFamily: data.settings.fontFamily }}>
                                <EditableText value={cell} tag="span" />
                              </span>
                            ) : (
                              <span className="flex items-center justify-center w-full h-full">
                                <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 border border-zinc-300" />
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

        <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-3 print:p-2 shadow-sm">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-indigo-600 text-[10px] font-black">i</span>
            </div>
            <p className="text-[9px] print:text-[8px] font-semibold text-zinc-600 leading-relaxed">
              Her satır, her sütun ve her kalın çizgili bölgede tüm semboller sadece <span className="text-indigo-600 font-black">BİR KEZ</span> kullanılmalıdır. Boş hücreleri doldur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
