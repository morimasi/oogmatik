import React from 'react';
import { useSuperTurkceV2Store } from '../../store/useSuperTurkceV2Store';
import { SuperTurkceModuleSettings } from '../../types/superTurkceModules';

export const STSettings: React.FC = () => {
  const { modules, activeModuleId, setActiveModule, updateModuleSettings } =
    useSuperTurkceV2Store();

  if (!activeModuleId) return null;

  const activeModule = modules.find((m) => m.id === activeModuleId);
  if (!activeModule) return null;

  const handleUpdate = (updates: Partial<SuperTurkceModuleSettings>) => {
    updateModuleSettings(activeModuleId, updates);
  };

  return (
    <div className="w-80 bg-[#0a0a0a] border-l border-zinc-800 flex flex-col h-full font-lexend z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] shrink-0">
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-[#080808]">
        <h2 className="text-zinc-200 text-sm font-bold flex items-center gap-2">
          <i className="fa-solid fa-sliders text-indigo-500"></i> Modül Ayarları
        </h2>
        <button
          onClick={() => setActiveModule(null)}
          className="w-6 h-6 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* 1. AKICILIK PİRAMİDİ */}
        {activeModule.type === 'st_fluency_pyramid' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Piramit Satır Sayısı (Derinlik)
              </label>
              <input
                type="number"
                min="2"
                max="6"
                value={(activeModule as any).linesCount}
                onChange={(e) => handleUpdate({ linesCount: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500"
              />
              <p className="text-[9px] text-zinc-600 font-medium">
                Satır sayısı kelime uzamasıyla eşittir. Çok zorlamamak için 4 idealdir.
              </p>
            </div>
          </div>
        )}

        {/* 2. MİKRO METİN */}
        {activeModule.type === 'st_scaffolded_reading' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Maksimum Kelime
              </label>
              <input
                type="number"
                value={(activeModule as any).maxWords}
                onChange={(e) => handleUpdate({ maxWords: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500"
              />
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
                className={`w-10 h-6 rounded-full transition-colors relative ${(activeModule as any).focusBar ? 'bg-indigo-500' : 'bg-zinc-800 border border-zinc-700'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${(activeModule as any).focusBar ? 'translate-x-5' : 'translate-x-1'}`}
                ></div>
              </div>
              <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">
                Satır Atlamayı Önleyici Bar (Focus)
              </span>
            </label>
          </div>
        )}

        {/* 3. 5N1K */}
        {activeModule.type === 'st_semantic_mapping' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 mb-2">
              Sorulacak Soruları Seçin
            </p>
            {['Kim', 'Ne', 'Nerede', 'Ne Zaman', 'Nasıl', 'Niçin'].map((q, i) => {
              const keys = ['askWho', 'askWhat', 'askWhere', 'askWhen', 'askHow', 'askWhy'];
              const key = keys[i];
              return (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-8 h-5 rounded-full transition-colors relative ${(activeModule as any)[key] ? 'bg-indigo-500' : 'bg-zinc-800 border border-zinc-700'}`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${(activeModule as any)[key] ? 'translate-x-4' : 'translate-x-1'}`}
                    ></div>
                  </div>
                  <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">
                    {q} Sorusunu Sor
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {/* 4. BOŞLUK DOLDURMA */}
        {activeModule.type === 'st_guided_cloze' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Çeldirici Kelime Sayısı
              </label>
              <input
                type="number"
                min="0"
                max="3"
                value={(activeModule as any).distractorCount}
                onChange={(e) => handleUpdate({ distractorCount: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500"
              />
              <p className="text-[9px] text-zinc-600 font-medium">
                Öğrenciyi çok zorlamamak için 0 veya 1 tavsiye edilir.
              </p>
            </div>
          </div>
        )}

        {/* 5. DUAL CODING */}
        {activeModule.type === 'st_dual_coding_match' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Eşleşme Tipi
              </label>
              <select
                value={(activeModule as any).matchType}
                onChange={(e) => handleUpdate({ matchType: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500"
              >
                <option value="synonym">Eş Anlamlılar</option>
                <option value="antonym">Zıt Anlamlılar</option>
                <option value="concept_definition">Kavram - Tanım</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Çift Sayısı (3-5)
              </label>
              <input
                type="number"
                min="2"
                max="6"
                value={(activeModule as any).pairCount}
                onChange={(e) => handleUpdate({ pairCount: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* 8. RADAR D/Y */}
        {activeModule.type === 'st_radar_true_false' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Yargı Sayısı
              </label>
              <input
                type="number"
                min="2"
                max="8"
                value={(activeModule as any).statementCount}
                onChange={(e) => handleUpdate({ statementCount: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${(activeModule as any).forbidNegativePhrasing ? 'bg-rose-500' : 'bg-zinc-800'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${(activeModule as any).forbidNegativePhrasing ? 'translate-x-5' : 'translate-x-1'}`}
                ></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">
                  Negatif Ek (-me, -ma) Yasakla
                </span>
                <span className="text-[9px] text-zinc-500 mt-0.5">
                  Dislekside açık kalması zorunludur. Tüm ifadeler düz cümle kurulur.
                </span>
              </div>
            </label>
          </div>
        )}

        {/* Default settings for others */}
        {[
          'st_story_sequencing',
          'st_cause_effect_analysis',
          'st_spot_highlight',
          'st_scaffolded_open',
        ].includes(activeModule.type) && (
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <i className="fa-solid fa-wand-magic-sparkles text-zinc-500 mb-2 block text-xl"></i>
            <h3 className="text-xs font-bold text-zinc-400">Otomatik Optimizasyon</h3>
            <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">
              Bu modül sistemin nöro-mimari motoru tarafından otomatik olarak öğrenci kısıtlarına
              göre uyarlanacaktır.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-900 bg-[#080808]">
        <button
          onClick={() => {
            if (confirm('Modülü kağıttan silmek istediğinize emin misiniz?')) {
              useSuperTurkceV2Store.getState().removeModule(activeModuleId);
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
