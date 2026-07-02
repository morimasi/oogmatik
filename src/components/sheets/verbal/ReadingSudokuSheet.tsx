import React from 'react';
import { ReadingSudokuData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const ReadingSudokuSheet = ({ data }: { data: ReadingSudokuData }) => {
  const size = data.settings.size || 4;
  const isBig = size > 4;
  const symbols = data.symbols || [];

  return (
    <div className="flex flex-col bg-white font-['Lexend'] text-zinc-900 relative overflow-visible w-full h-full print:w-[210mm] print:h-[297mm] print:overflow-hidden px-[12mm] py-[15mm] professional-worksheet">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-100"></div>

      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
      />

      <div className="mt-3 print:mt-2 space-y-3 print:space-y-2 flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2 print:gap-1 justify-center">
          {symbols.map((sym, idx) => (
            <div
              key={idx}
              className={`
                border border-zinc-300 flex items-center justify-center rounded-lg shadow-sm
                ${isBig ? 'w-8 h-8' : 'w-10 h-10'}
              `}
              style={{ fontFamily: data.settings.fontFamily }}
            >
              {sym.imagePrompt ? (
                <span className="font-black text-zinc-700 text-[11px]">{sym.value}</span>
              ) : (
                <span className={`
                  font-black text-zinc-800 select-none
                  ${isBig ? 'text-[12px]' : 'text-lg'}
                `}>
                  {sym.value}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <div className="inline-block bg-zinc-900 rounded-[1.5rem] p-1.5 shadow-xl border border-zinc-800">
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="border-collapse">
                <tbody>
                  {data.grid.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => {
                        const isRightEdge =
                          (cIdx + 1) % (size === 4 ? 2 : size === 6 ? 3 : 2) === 0 && cIdx !== size - 1;
                        const isBottomEdge =
                          (rIdx + 1) % (size === 4 ? 2 : size === 6 ? 2 : 3) === 0 && rIdx !== size - 1;

                        return (
                          <td
                            key={cIdx}
                            className={`
                              text-center relative
                              border border-zinc-200
                              ${isBig ? 'w-9 h-9 text-[13px]' : 'w-11 h-11 text-base'}
                              ${isRightEdge ? 'border-r-3 border-r-zinc-900' : ''}
                              ${isBottomEdge ? 'border-b-3 border-b-zinc-900' : ''}
                            `}
                          >
                            {cell ? (
                              <span className="font-black text-zinc-950 flex items-center justify-center w-full h-full"
                                style={{ fontFamily: data.settings.fontFamily }}>
                                <EditableText value={cell} tag="span" />
                              </span>
                            ) : (
                              <span className="flex items-center justify-center w-full h-full">
                                <span className="w-2 h-2 rounded-full bg-zinc-300 border border-zinc-400 opacity-60" />
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

        <div className="bg-zinc-50 rounded-[1.25rem] border border-zinc-200 p-2.5 print:p-2 shadow-sm mt-auto">
          <div className="flex items-start gap-1.5">
            <div className="w-4.5 h-4.5 rounded-md bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-indigo-600 text-[9px] font-black">i</span>
            </div>
            <p className="text-[8px] print:text-[7.5px] font-semibold text-zinc-600 leading-snug">
              Her satır, her sütun ve her kalın çizgili bölgede tüm semboller sadece <span className="text-indigo-600 font-black">BİR KEZ</span> kullanılmalıdır. Boş hücreleri doldur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
