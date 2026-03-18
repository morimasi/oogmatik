import React from 'react';
import { useSuperTurkceV2Store } from '../../store/useSuperTurkceV2Store';
import { SuperTurkceModuleId } from '../../types/superTurkceModules';

const ST_MODULES: {
  id: SuperTurkceModuleId;
  label: string;
  icon: string;
  desc: string;
  iconClass: string;
}[] = [
  {
    id: 'st_fluency_pyramid',
    label: 'Okuma Akıcılığı Piramidi',
    icon: 'fa-sort-amount-down',
    desc: 'Göz takibi için kelime piramidi',
    iconClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    id: 'st_scaffolded_reading',
    label: 'Nöro-Uyumlu Mikro Metin',
    icon: 'fa-book-open-reader',
    desc: 'Kısa, etken çatılı metin',
    iconClass: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  },
  {
    id: 'st_semantic_mapping',
    label: 'Görsel 5N1K Haritası',
    icon: 'fa-diagram-project',
    desc: 'Olay ve görsel analiz',
    iconClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  {
    id: 'st_guided_cloze',
    label: 'Elkonin Boşluk Doldurma',
    icon: 'fa-square-check',
    desc: 'Kutu uzunluklu boşluklar',
    iconClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  {
    id: 'st_dual_coding_match',
    label: 'Dual-Coding Eşleştirme',
    icon: 'fa-link',
    desc: 'Kelime ve ikon eşleme',
    iconClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: 'st_story_sequencing',
    label: 'Yürütücü İşlev Sıralaması',
    icon: 'fa-arrow-down-1-9',
    desc: 'Olay adım numaralandırma',
    iconClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    id: 'st_cause_effect_analysis',
    label: 'LGS Sebep-Sonuç Mantığı',
    icon: 'fa-scale-balanced',
    desc: 'Neden ve Çıkarım tablosu',
    iconClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    id: 'st_radar_true_false',
    label: 'Radar Testi (D/Y)',
    icon: 'fa-check-double',
    desc: 'Büyük ✅/❌ butonlu',
    iconClass: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  },
  {
    id: 'st_spot_highlight',
    label: 'Seçici Dikkat Dedektifliği',
    icon: 'fa-magnifying-glass',
    desc: 'Metin/Harf matrisi tarama',
    iconClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    id: 'st_scaffolded_open',
    label: 'Destekli Açık Uçlu',
    icon: 'fa-pen-nib',
    desc: 'Başlangıç ipuçlu soru',
    iconClass: 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20',
  },
];

export const STPalette: React.FC = () => {
  const { addModule, modules } = useSuperTurkceV2Store();

  return (
    <div className="w-72 bg-[#080808] border-r border-zinc-800 flex flex-col h-full font-lexend z-10 shadow-2xl shrink-0">
      <div className="p-4 border-b border-zinc-900/50">
        <h2 className="text-zinc-200 text-sm font-bold flex items-center gap-2">
          <i className="fa-solid fa-shapes text-indigo-500"></i> Süper Modüller
        </h2>
        <p className="text-[10px] text-zinc-500 font-medium uppercase mt-1 tracking-widest leading-relaxed">
          Kağıda eklemek istediğiniz modüle tıklayın. Öğrenci için {modules.length} modül seçildi.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-[#030303]">
        {ST_MODULES.map((mod) => (
          <button
            key={mod.id}
            onClick={() => addModule(mod.id)}
            className="w-full text-left p-3 rounded-2xl bg-[#0a0a0a] hover:bg-[#121212] border border-zinc-800/80 hover:border-indigo-500/40 transition-all duration-300 group relative overflow-hidden flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_5px_15px_rgba(99,102,241,0.05)]"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110 ${mod.iconClass}`}
            >
              <i className={`fa-solid ${mod.icon} text-lg drop-shadow-md`}></i>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-[11px] font-black text-zinc-300 group-hover:text-indigo-400 transition-colors truncate tracking-wide uppercase">
                {mod.label}
              </h3>
              <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {mod.desc}
              </p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <i className="fa-solid fa-plus text-indigo-500 text-sm"></i>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-900 bg-[#050505]">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
          <i className="fa-solid fa-bolt text-emerald-400 mt-0.5"></i>
          <p className="text-[9px] text-emerald-300/80 font-medium leading-relaxed uppercase tracking-wider">
            Süper Türkçe, Bilişsel Yük Kuramı (CLT) ile %100 uyumludur. Modülleri dikkatlice seçin.
          </p>
        </div>
      </div>
    </div>
  );
};
