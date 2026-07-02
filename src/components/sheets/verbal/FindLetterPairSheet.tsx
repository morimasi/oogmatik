import React from 'react';
import { FindLetterPairData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FindLetterPairSheet = ({ data }: { data: FindLetterPairData }) => {
  const { grids = [], settings = { gridSize: 8 } as any } = data || {};

  // Grid yerleşimi: Öğe sayısına göre sütun belirleme
  const gridColsClass =
    grids.length === 1
      ? 'grid-cols-1'
      : grids.length === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-2';

  return (
    <div className="flex flex-col bg-white p-3 print:p-2 font-lexend text-black overflow-visible min-h-[297mm]">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
      />

      <div className={`grid ${gridColsClass} gap-x-4 print:gap-x-2 gap-y-6 print:gap-y-3 mt-3 print:mt-2 content-start`}>
        {(grids || []).map((item, idx) => (
          <div key={idx} className="flex flex-col items-center break-inside-avoid group">
            {/* HEDEF GÖSTERGESİ */}
            <EditableElement className="mb-3 print:mb-1 flex flex-col items-center">
              <span className="text-[8px] print:text-[7px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-1">
                HEDEF İKİLİ
              </span>
              <div className="px-6 print:px-3 py-2 print:py-1 bg-zinc-900 text-white rounded-xl font-black text-2xl print:text-xl shadow-lg border-2 border-white ring-4 ring-zinc-50">
                <EditableText value={item.targetPair} tag="span" />
              </div>
            </EditableElement>

            {/* HARF TABLOSU */}
            <div className="bg-white border-2 border-zinc-900 p-2 print:p-1 rounded-2xl shadow-lg overflow-hidden relative group-hover:border-indigo-500 transition-colors">
              <table className="border-collapse">
                <tbody>
                  {item.grid.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`
                                                        border border-zinc-200 text-center font-black transition-all hover:bg-indigo-50 cursor-default select-none text-zinc-900
                                                        ${settings.gridSize > 12 ? 'w-7 h-7 text-xs' : settings.gridSize > 8 ? 'w-9 h-9 text-base' : 'w-11 h-11 text-lg'}
                                                    `}
                        >
                          <EditableText value={cell} tag="span" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PUANLAMA / İSTATİSTİK ŞERİDİ */}
            <div className="mt-4 print:mt-2 flex gap-4 print:gap-2 w-full max-w-[200px]">
              <div className="flex-1 text-center">
                <span className="text-[7px] print:text-[6px] font-black text-zinc-400 uppercase tracking-widest">
                  BULUNAN
                </span>
                <div className="h-7 border-b border-dashed border-zinc-300 flex items-center justify-center font-bold text-zinc-400 italic text-xs">
                  / {settings.gridSize > 10 ? '12+' : '8'}
                </div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-[7px] print:text-[6px] font-black text-zinc-400 uppercase tracking-widest">
                  SÜRE
                </span>
                <div className="h-7 border-b border-dashed border-zinc-300 flex items-center justify-center font-bold text-zinc-400 italic text-xs">
                  00:00
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 print:pt-1 flex justify-between items-center px-4 print:px-2 border-t border-zinc-200 opacity-40">
        <div className="flex flex-col">
          <span className="text-[6px] print:text-[5px] font-black text-zinc-400 uppercase tracking-[0.15em]">
            Kategori
          </span>
          <span className="text-[8px] print:text-[7px] font-bold text-zinc-700 uppercase">
            Görsel Tarama & Dikkat
          </span>
        </div>
        <div className="flex gap-2 print:gap-1">
          <i className="fa-solid fa-eye text-base"></i>
          <i className="fa-solid fa-brain text-base"></i>
        </div>
      </div>
    </div>
  );
};

