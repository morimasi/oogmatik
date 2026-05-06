import React from 'react';
import { ActivityType } from '../../../types/activity';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

interface MeyveliToplamaData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  pedagogicalNote: string;
  grid: { 
    fruits: string[]; 
    gridIndices: number[][]; 
    rowSum: number[]; 
    colSum: number[]; 
    fruitValues: number[]; 
  }[];
  settings: Record<string, unknown>;
}

export const MeyveliToplamaSheet: React.FC<{ data: MeyveliToplamaData }> = ({ data }) => {
  const grids = data.grid || [];
  
  // Determine layout class based on number of grids to optimize A4 space
  const getGridContainerClass = () => {
    if (grids.length >= 6) return 'grid grid-cols-2 gap-x-6 gap-y-8';
    if (grids.length === 4) return 'grid grid-cols-2 gap-x-12 gap-y-12 mt-8';
    if (grids.length === 2) return 'grid grid-cols-1 gap-y-16 mt-8 max-w-2xl mx-auto';
    return 'flex flex-col items-center mt-12 gap-12';
  };

  return (
    <div className="flex flex-col bg-white p-8 text-black font-lexend min-h-[1123px]">
      <PedagogicalHeader
        title={data.title || 'Meyveli Matematik Bulmacası'}
        instruction={data.instruction || 'Satır ve sütunlardaki toplamları kullanarak her meyvenin değerini bulunuz.'}
        note={data.pedagogicalNote}
      />

      <div className={getGridContainerClass()}>
        {grids.map((puzzle, index) => {
          const gridSize = puzzle.gridIndices?.length || 3;
          
          return (
            <div key={index} className="flex flex-col items-center bg-zinc-50 p-6 rounded-2xl border-2 border-zinc-100 shadow-sm relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-white shadow-sm">
                {index + 1}
              </div>
              
              {/* Puzzle Grid */}
              <div className="flex">
                <div className="flex flex-col gap-2">
                  {puzzle.gridIndices.map((row, rIdx) => (
                    <div key={`r-${rIdx}`} className="flex gap-2">
                      {row.map((col, cIdx) => (
                        <div
                          key={`c-${cIdx}`}
                          className="w-14 h-14 bg-white border-2 border-zinc-200 rounded-xl flex items-center justify-center text-3xl shadow-sm"
                        >
                          {puzzle.fruits[col]}
                        </div>
                      ))}
                      {/* Row Sum */}
                      <div className="w-14 h-14 flex items-center justify-center text-xl font-bold text-indigo-600 bg-indigo-50 rounded-xl border border-indigo-100 ml-2">
                        {puzzle.rowSum[rIdx]}
                      </div>
                    </div>
                  ))}
                  
                  {/* Col Sums */}
                  <div className="flex gap-2 mt-2">
                    {puzzle.colSum.map((sum, cIdx) => (
                      <div key={`cs-${cIdx}`} className="w-14 h-14 flex items-center justify-center text-xl font-bold text-indigo-600 bg-indigo-50 rounded-xl border border-indigo-100">
                        {sum}
                      </div>
                    ))}
                    <div className="w-14 h-14 flex items-center justify-center">
                      <i className="fa-solid fa-arrow-up-right-dots text-zinc-300 text-xl"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer Area */}
              <div className="mt-6 w-full pt-4 border-t-2 border-zinc-200 border-dashed flex justify-center gap-6">
                {puzzle.fruits.map((fruit, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2">
                    <span className="text-2xl">{fruit}</span>
                    <span className="text-zinc-400 font-bold">=</span>
                    <div className="w-12 h-10 bg-white border-2 border-zinc-300 rounded-lg flex items-center justify-center">
                      <span className="text-zinc-200 text-xs font-bold uppercase">?</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-auto pt-8 border-t border-zinc-100 flex justify-between items-center opacity-50">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-calculator text-indigo-500"></i>
          <p className="text-[8px] font-bold uppercase tracking-wider">Cebirsel Düşünme & Problem Çözme</p>
        </div>
      </div>
    </div>
  );
};

export default MeyveliToplamaSheet;
