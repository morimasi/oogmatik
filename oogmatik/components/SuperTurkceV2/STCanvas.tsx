import React from 'react';
import { useSuperTurkceV2Store } from '../../store/useSuperTurkceV2Store';
import { SuperTurkceModuleSettings } from '../../types/superTurkceModules';
import { STRenderer } from './STRenderer';

export const STCanvas: React.FC = () => {
  const { modules, activeModuleId, setActiveModule, generatedData, isGenerating } =
    useSuperTurkceV2Store();

  if (modules.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none bg-zinc-900/10">
        <div className="w-24 h-24 mb-6 text-indigo-500/20 flex items-center justify-center relative">
          <i className="fa-solid fa-file-dashed text-6xl absolute z-10"></i>
          <i className="fa-solid fa-plus text-2xl absolute z-20 text-indigo-500 bg-[#050505] rounded-full w-8 h-8 flex items-center justify-center border-4 border-[#050505] -bottom-2 -right-2"></i>
        </div>
        <h3 className="text-xl font-bold text-zinc-400 mb-2">Çalışma Alanı Boş</h3>
        <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-medium">
          Sol paletten istediğiniz modülleri seçerek Bilişsel Yükü optimize edilmiş klinik Türkçe
          çalışma kağıdını oluşturun.
        </p>
      </div>
    );
  }

  const getModuleLabel = (type: string) => {
    switch (type) {
      case 'st_fluency_pyramid':
        return {
          label: 'Okuma Akıcılığı Piramidi',
          icon: 'fa-sort-amount-down',
          color: 'text-emerald-500',
        };
      case 'st_scaffolded_reading':
        return {
          label: 'Nöro-Uyumlu Mikro Metin',
          icon: 'fa-book-open-reader',
          color: 'text-teal-500',
        };
      case 'st_semantic_mapping':
        return {
          label: 'Görsel 5N1K Haritası',
          icon: 'fa-diagram-project',
          color: 'text-indigo-400',
        };
      case 'st_guided_cloze':
        return { label: 'Elkonin Boşluk Doldurma', icon: 'fa-square-check', color: 'text-sky-400' };
      case 'st_dual_coding_match':
        return { label: 'Dual-Coding Eşleştirme', icon: 'fa-link', color: 'text-blue-400' };
      case 'st_story_sequencing':
        return {
          label: 'Yürütücü İşlev Sıralaması',
          icon: 'fa-arrow-down-1-9',
          color: 'text-amber-500',
        };
      case 'st_cause_effect_analysis':
        return {
          label: 'LGS Sebep-Sonuç Mantığı',
          icon: 'fa-scale-balanced',
          color: 'text-rose-400',
        };
      case 'st_radar_true_false':
        return { label: 'Radar Testi (D/Y)', icon: 'fa-check-double', color: 'text-fuchsia-400' };
      case 'st_spot_highlight':
        return {
          label: 'Seçici Dikkat Dedektifliği',
          icon: 'fa-magnifying-glass',
          color: 'text-purple-400',
        };
      case 'st_scaffolded_open':
        return { label: 'Destekli Açık Uçlu', icon: 'fa-pen-nib', color: 'text-zinc-500' };
      default:
        return { label: 'Bilinmeyen Modül', icon: 'fa-box', color: 'text-zinc-500' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-8 flex flex-col items-center custom-scrollbar relative">
      {isGenerating && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="mt-6 text-sm font-bold text-indigo-400 tracking-widest uppercase animate-pulse">
            <i className="fa-solid fa-brain mr-2"></i> Kognitif Optimizasyon Yapılıyor...
          </p>
        </div>
      )}

      {/* A4 Kağıt Boyutu */}
      <div className="w-[800px] bg-white min-h-[1131px] rounded-lg shadow-2xl p-12 text-zinc-900 relative">
        {/* Header (Ad Soyad) */}
        <div className="flex justify-between items-end border-b-4 border-zinc-900 pb-4 mb-10">
          <div>
            <h2 className="text-3xl font-black font-lexend text-zinc-900 tracking-tighter uppercase">
              Süper Türkçe V2
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">
              Klinik Okuma-Anlama Stüdyosu
            </p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Ad Soyad:</span>
              <div className="border-b-2 border-zinc-300 w-40 border-dashed"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Sınıf:</span>
              <div className="border-b-2 border-zinc-300 w-16 border-dashed"></div>
            </div>
          </div>
        </div>

        {/* Modül İskeletleri */}
        <div className="space-y-6">
          {modules.map((mod: SuperTurkceModuleSettings, index: number) => {
            const info = getModuleLabel(mod.type);
            const isActive = activeModuleId === mod.id;
            const hasData = generatedData && generatedData[mod.id];

            return (
              <div
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`
                                    relative group rounded-3xl border-2 transition-all cursor-pointer font-lexend
                                    ${isActive ? 'border-indigo-400 bg-indigo-50/50 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100'}
                                    ${hasData ? 'border-emerald-200 bg-white shadow-md' : ''}
                                `}
              >
                {/* Drag Handle */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-zinc-400 cursor-grab hover:text-zinc-600 transition-colors">
                  <i className="fa-solid fa-grip-vertical"></i>
                </div>

                <div className="p-6 flex items-start gap-5">
                  {!hasData && (
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm border border-zinc-200 ${info.color}`}
                    >
                      <i className={`fa-solid ${info.icon} text-xl`}></i>
                    </div>
                  )}

                  <div className="flex-1 w-full">
                    {!hasData && (
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-zinc-800">
                          {index + 1}. {info.label}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-zinc-400 bg-zinc-200 px-2 py-0.5 rounded uppercase tracking-wider">
                            İskelet
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModule(mod.id);
                            }}
                            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-500 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700'}`}
                          >
                            <i className="fa-solid fa-gear text-xs"></i>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* İskelet veya Data Görünümü */}
                    <div className={hasData ? 'w-full' : 'mt-4'}>
                      {hasData ? (
                        <div className="w-full print-break-inside-avoid">
                          <STRenderer moduleConfig={mod} data={generatedData[mod.id]} />
                        </div>
                      ) : (
                        <div className="space-y-2 opacity-40">
                          <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
                          <div className="h-4 bg-zinc-200 rounded w-full"></div>
                          <div className="h-4 bg-zinc-200 rounded w-5/6"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">
        A4 Kağıdı (210 x 297 mm) Baskı Sınırı
      </div>
    </div>
  );
};
