import React from 'react';
import { usePremiumStudioStore } from '../../store/usePremiumStudioStore';
import { PremiumModuleSettings } from '../../types/premiumModules';
import { ModuleRenderer } from './Renderers/ModuleRenderer';

export const StudioCanvas: React.FC = () => {
  const { modules, activeModuleId, setActiveModule, generatedData, isGenerating } =
    usePremiumStudioStore();

  if (modules.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none bg-zinc-900/10">
        <div className="w-24 h-24 mb-6 text-zinc-800 flex items-center justify-center relative">
          <i className="fa-solid fa-file-dashed text-6xl absolute z-10"></i>
          <i className="fa-solid fa-plus text-2xl absolute z-20 text-zinc-700 bg-[#050505] rounded-full w-8 h-8 flex items-center justify-center border-4 border-[#050505] -bottom-2 -right-2"></i>
        </div>
        <h3 className="text-xl font-bold text-zinc-400 mb-2">Kağıt Boş</h3>
        <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-medium">
          Sol paletten istediğiniz modülleri seçerek Bilişsel Yükü optimize edilmiş bir çalışma
          kağıdı iskeleti oluşturun.
        </p>
      </div>
    );
  }

  const getModuleLabel = (type: string) => {
    switch (type) {
      case 'scaffolded_reading':
        return { label: 'Mikro-Öğrenme Metni', icon: 'fa-book-open', color: 'text-emerald-500' };
      case 'concept_matching':
        return {
          label: 'Görsel-Kavram Eşleştirme',
          icon: 'fa-bezier-curve',
          color: 'text-indigo-500',
        };
      case 'guided_cloze':
        return {
          label: 'Yönlendirmeli Boşluk Doldurma',
          icon: 'fa-square-check',
          color: 'text-sky-500',
        };
      case 'true_false_logic':
        return { label: 'Mantık Ağacı', icon: 'fa-scale-balanced', color: 'text-rose-500' };
      case 'step_sequencing':
        return { label: 'Algoritmik Sıralama', icon: 'fa-arrow-down-1-9', color: 'text-amber-500' };
      case 'scaffolded_open_ended':
        return { label: 'Destekli Açık Uçlu', icon: 'fa-pen-nib', color: 'text-fuchsia-500' };
      case 'visual_multiple_choice':
        return { label: 'Görsel Çoktan Seçmeli', icon: 'fa-list-check', color: 'text-blue-500' };
      case 'spot_and_highlight':
        return {
          label: 'Odaklı Bul / İşaretle',
          icon: 'fa-magnifying-glass',
          color: 'text-teal-500',
        };
      case 'mini_mind_map':
        return {
          label: 'Mini Zihin Haritası',
          icon: 'fa-diagram-project',
          color: 'text-violet-500',
        };
      case 'exit_ticket':
        return { label: 'Çıkış Bileti', icon: 'fa-ticket', color: 'text-zinc-400' };
      default:
        return { label: 'Bilinmeyen Modül', icon: 'fa-box', color: 'text-zinc-500' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-8 flex flex-col items-center custom-scrollbar relative">
      {isGenerating && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="mt-6 text-sm font-bold text-amber-500 tracking-widest uppercase animate-pulse">
            <i className="fa-solid fa-dna mr-2"></i> Bilişsel Modelleme Yapılıyor...
          </p>
        </div>
      )}

      {/* A4 Kağıt Boyutunda Çalışma Alanı (Scale) */}
      <div className="w-[800px] bg-white min-h-[1131px] rounded-lg shadow-2xl p-12 text-zinc-900 relative">
        {/* Header (Ad Soyad) */}
        <div className="flex justify-between items-end border-b-2 border-zinc-200 pb-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold font-lexend text-zinc-800 tracking-tight">
              Oogmatik Premium
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">
              Nöro-Bilişsel Çalışma Kağıdı
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Ad Soyad:</span>
              <div className="border-b border-zinc-300 w-32 border-dashed"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Sınıf:</span>
              <div className="border-b border-zinc-300 w-16 border-dashed"></div>
            </div>
          </div>
        </div>

        {/* Modül İskeletleri */}
        <div className="space-y-6">
          {modules.map((mod: PremiumModuleSettings, index: number) => {
            const info = getModuleLabel(mod.type);
            const isActive = activeModuleId === mod.id;
            const hasData = generatedData && generatedData[mod.id];

            return (
              <div
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`
                                    relative group rounded-2xl border-2 transition-all cursor-pointer font-lexend
                                    ${isActive ? 'border-amber-400 bg-amber-50/50 shadow-[0_0_0_4px_rgba(245,158,11,0.1)]' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100'}
                                    ${hasData ? 'border-emerald-200 bg-emerald-50/30' : ''}
                                `}
              >
                {/* Drag Handle */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-zinc-400 cursor-grab hover:text-zinc-600 transition-colors">
                  <i className="fa-solid fa-grip-vertical"></i>
                </div>

                <div className="p-5 flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm border border-zinc-200 ${info.color}`}
                  >
                    <i className={`fa-solid ${info.icon} text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-zinc-800">
                        {index + 1}. {info.label}
                      </h3>
                      <div className="flex items-center gap-2">
                        {hasData ? (
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            <i className="fa-solid fa-check"></i> Üretildi
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-zinc-400 bg-zinc-200 px-2 py-0.5 rounded uppercase tracking-wider">
                            İskelet
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModule(mod.id);
                          }}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isActive ? 'bg-amber-500 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700'}`}
                        >
                          <i className="fa-solid fa-gear text-xs"></i>
                        </button>
                      </div>
                    </div>

                    {/* İskelet veya Data Görünümü */}
                    <div className="mt-4">
                      {hasData ? (
                        <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-sm print-break-inside-avoid">
                          <ModuleRenderer moduleConfig={mod} data={generatedData[mod.id]} />
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
