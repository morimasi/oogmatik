import React from 'react';
import { useSariKitapStore } from '../../../store/useSariKitapStore';
import { SheetRenderer } from '../../SheetRenderer';

export const CenterPanel: React.FC = () => {
  const { result, selectedActivity, isGenerating, error } = useSariKitapStore();

  return (
    <div className="flex-1 h-full bg-[#111827] flex flex-col items-center overflow-y-auto custom-scrollbar p-10">
      {/* A4 Preview Container */}
      <div className="relative shadow-2xl shadow-black/50">
        {isGenerating ? (
          <div className="w-[210mm] h-[297mm] bg-white rounded-sm flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-wand-sparkles text-yellow-500 text-2xl animate-pulse"></i>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: 'Lexend' }}>İçerik Hazırlanıyor</h3>
              <p className="text-sm text-slate-400 font-medium">Yapay zeka pedagojik yapıyı kurguluyor...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-[210mm] h-[297mm] bg-white rounded-sm flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-rose-50 flex items-center justify-center text-rose-500 mb-6">
              <i className="fa-solid fa-circle-exclamation text-3xl"></i>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Üretim Başarısız</h3>
            <p className="text-sm text-slate-500 max-w-xs">{error}</p>
          </div>
        ) : result ? (
          <div className="w-[210mm] min-h-[297mm] bg-white rounded-sm overflow-hidden scale-[0.85] origin-top transform-gpu">
             <SheetRenderer 
               activityType={selectedActivity} 
               data={result} 
               hideWrapper={true}
             />
          </div>
        ) : (
          <div className="w-[210mm] h-[297mm] bg-white/5 border-2 border-dashed border-white/10 rounded-sm flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 rounded-[2.5rem] bg-slate-900/50 flex items-center justify-center text-slate-700 mb-8">
              <i className="fa-solid fa-file-invoice text-4xl"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-500 uppercase tracking-tighter mb-4" style={{ fontFamily: 'Lexend' }}>Önizleme Bekleniyor</h3>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              Sol panelden bir etkinlik seçin veya bir PDF dosyası yükleyerek 
              <span className="text-yellow-500/80 font-bold"> AI Destekli Analiz</span> motorunu başlatın.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-12 w-full max-w-md opacity-20">
              <div className="h-2 bg-slate-700 rounded-full"></div>
              <div className="h-2 bg-slate-700 rounded-full"></div>
              <div className="h-2 bg-slate-700 rounded-full"></div>
              <div className="col-span-2 h-2 bg-slate-700 rounded-full"></div>
              <div className="h-2 bg-slate-700 rounded-full"></div>
              <div className="h-32 col-span-3 bg-slate-800/50 rounded-2xl border border-white/5"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
