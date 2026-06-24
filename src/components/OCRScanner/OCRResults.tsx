import React from 'react';
import { ActivityType, WorksheetData, StyleSettings } from '../../types';
import Worksheet from '../Worksheet';
import { PREVIEW_SETTINGS } from './useOCRScanner';

interface OCRResultsProps {
  finalData: WorksheetData;
  onResult: (data: any) => void;
}

export const OCRResults = ({ finalData, onResult }: OCRResultsProps) => {
  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center mb-8 bg-zinc-900/80 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4 pl-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20">
            <i className="fa-solid fa-check-double"></i>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Başarılı
            </span>
            <h4 className="text-lg font-black text-white leading-none">
              {(finalData as unknown[]).length > 1
                ? `${(finalData as unknown[]).length} Varyant Hazır`
                : 'Mimari Klon Hazır'}
            </h4>
          </div>
        </div>
        <button
          onClick={() => onResult(finalData)}
          className="px-12 py-4 bg-white text-indigo-950 font-black rounded-2xl text-sm shadow-xl hover:scale-105 transition-all uppercase tracking-widest"
        >
          DÜZENLE VE YAZDIR <i className="fa-solid fa-chevron-right ml-2"></i>
        </button>
      </div>
      <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl border-[15px] border-white/5 transform scale-[0.98]">
        <Worksheet
          activityType={ActivityType.OCR_CONTENT}
          data={finalData}
          settings={PREVIEW_SETTINGS}
        />
      </div>
    </div>
  );
};
