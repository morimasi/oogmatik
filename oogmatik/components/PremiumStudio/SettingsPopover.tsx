import React from 'react';
import { usePremiumStudioStore } from '../../store/usePremiumStudioStore';
import { PremiumModuleSettings } from '../../types/premiumModules';

export const SettingsPopover: React.FC = () => {
  const { modules, activeModuleId, setActiveModule, updateModuleSettings } =
    usePremiumStudioStore();

  if (!activeModuleId) return null;

  const activeModule = modules.find((m) => m.id === activeModuleId);
  if (!activeModule) return null;

  const handleUpdate = (updates: Partial<PremiumModuleSettings>) => {
    updateModuleSettings(activeModuleId, updates);
  };

  return (
    <div className="w-80 bg-[#0a0a0a] border-l border-zinc-800 flex flex-col h-full font-lexend z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] shrink-0">
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-[#080808]">
        <h2 className="text-zinc-200 text-sm font-bold flex items-center gap-2">
          <i className="fa-solid fa-sliders text-amber-500"></i> Modül Ayarları
        </h2>
        <button
          onClick={() => setActiveModule(null)}
          className="w-6 h-6 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* 1. MİKRO ÖĞRENME METNİ AYARLARI */}
        {activeModule.type === 'scaffolded_reading' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Maksimum Kelime
              </label>
              <input
                type="number"
                value={(activeModule as any).maxWords}
                onChange={(e) => handleUpdate({ maxWords: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
              />
              <p className="text-[9px] text-zinc-600 font-medium">
                Derin disleksi için maks 30-40, normal için 80 kelime önerilir.
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${(activeModule as any).syllableColoring ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${(activeModule as any).syllableColoring ? 'translate-x-5' : 'translate-x-1'}`}
                ></div>
              </div>
              <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">
                Hece Renklendirme Aktif
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${(activeModule as any).highlightKeywords ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${(activeModule as any).highlightKeywords ? 'translate-x-5' : 'translate-x-1'}`}
                ></div>
              </div>
              <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">
                Anahtar Kelime Vurgusu
              </span>
            </label>
          </div>
        )}

        {/* 2. KAVRAM EŞLEŞTİRME AYARLARI */}
        {activeModule.type === 'concept_matching' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Çift Sayısı (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={(activeModule as any).pairCount}
                onChange={(e) => handleUpdate({ pairCount: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${(activeModule as any).hasDistractors ? 'bg-amber-500' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${(activeModule as any).hasDistractors ? 'translate-x-5' : 'translate-x-1'}`}
                ></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">
                  Çeldirici Kullan
                </span>
                <span className="text-[9px] text-amber-500 font-medium uppercase mt-0.5 tracking-wider">
                  Dikkat: Bilişsel Yükü Artırır
                </span>
              </div>
            </label>
          </div>
        )}

        {/* 3. YÖNLENDİRMELİ BOŞLUK DOLDURMA */}
        {activeModule.type === 'guided_cloze' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${(activeModule as any).showWordPool ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${(activeModule as any).showWordPool ? 'translate-x-5' : 'translate-x-1'}`}
                ></div>
              </div>
              <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">
                Kelime Havuzu Göster
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${(activeModule as any).useElkoninBoxes ? 'bg-sky-500' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${(activeModule as any).useElkoninBoxes ? 'translate-x-5' : 'translate-x-1'}`}
                ></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">
                  Elkonin Kutuları (Harf Sayısı)
                </span>
                <span className="text-[9px] text-zinc-500 font-medium mt-0.5">
                  Kelimeyi şekille destekler
                </span>
              </div>
            </label>
          </div>
        )}

        {/* 4. DOĞRU/YANLIŞ */}
        {activeModule.type === 'true_false_logic' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Soru Sayısı
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={(activeModule as any).questionCount}
                onChange={(e) => handleUpdate({ questionCount: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${(activeModule as any).allowNegativePhrasing ? 'bg-red-500' : 'bg-emerald-500'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${(activeModule as any).allowNegativePhrasing ? 'translate-x-5' : 'translate-x-1'}`}
                ></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">
                  {(activeModule as any).allowNegativePhrasing
                    ? 'Negatif Yönerge Açık'
                    : 'Sadece Pozitif Cümleler'}
                </span>
                <span className="text-[9px] text-zinc-500 font-medium mt-0.5 leading-tight">
                  Dislekside olumsuz ekleri (örn: yapmamalıdır) işlemlemek çok zordur. Kapalı
                  tutulması önerilir.
                </span>
              </div>
            </label>
          </div>
        )}

        {/* Diğer modüller benzer yapıda eklenebilir... */}
        {[
          'visual_multiple_choice',
          'spot_and_highlight',
          'mini_mind_map',
          'exit_ticket',
          'step_sequencing',
          'scaffolded_open_ended',
        ].includes(activeModule.type) && (
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <i className="fa-solid fa-screwdriver-wrench text-zinc-500 mb-2 block text-xl"></i>
            <h3 className="text-xs font-bold text-zinc-400">Gelişmiş Ayarlar</h3>
            <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">
              Bu modülün mikro-ayarları sistem tarafından otomatik optimize edilecektir.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-900 bg-[#080808]">
        <button
          onClick={() => {
            if (confirm('Modülü kağıttan silmek istediğinize emin misiniz?')) {
              usePremiumStudioStore.getState().removeModule(activeModuleId);
            }
          }}
          className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-trash"></i> Modülü Sil
        </button>
      </div>
    </div>
  );
};
