import React from 'react';
import { usePremiumStudioStore } from '../../store/usePremiumStudioStore';
import { PremiumModuleId } from '../../types/premiumModules';

const MODULES: {
  id: PremiumModuleId;
  label: string;
  icon: string;
  desc: string;
  iconClass: string;
}[] = [
  {
    id: 'scaffolded_reading',
    label: 'Mikro-Öğrenme Metni',
    icon: 'fa-book-open',
    desc: 'Kısa, hece-renkli hikaye',
    iconClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    id: 'concept_matching',
    label: 'Görsel-Kavram Eşleştirme',
    icon: 'fa-bezier-curve',
    desc: 'Sözcük ve ikon bağlama',
    iconClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  {
    id: 'guided_cloze',
    label: 'Yönlendirmeli Boşluk Doldurma',
    icon: 'fa-square-check',
    desc: 'Elkonin kutulu kelime havuzu',
    iconClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  {
    id: 'true_false_logic',
    label: 'Mantık Ağacı (Doğru/Yanlış)',
    icon: 'fa-scale-balanced',
    desc: 'Net D/Y ifadeleri',
    iconClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    id: 'step_sequencing',
    label: 'Algoritmik Sıralama',
    icon: 'fa-arrow-down-1-9',
    desc: 'Olay/İşlem adımları (1-2-3)',
    iconClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    id: 'scaffolded_open_ended',
    label: 'Destekli Açık Uçlu',
    icon: 'fa-pen-nib',
    desc: 'Cümle başı ipuçlu soru',
    iconClass: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  },
  {
    id: 'visual_multiple_choice',
    label: 'Görsel Çoktan Seçmeli',
    icon: 'fa-list-check',
    desc: 'Büyük ikonlu şıklar',
    iconClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: 'spot_and_highlight',
    label: 'Odaklı Bul / İşaretle',
    icon: 'fa-magnifying-glass',
    desc: 'Harf/Kelime avcılığı',
    iconClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
  {
    id: 'mini_mind_map',
    label: 'Mini Zihin Haritası',
    icon: 'fa-diagram-project',
    desc: 'Ortadan dallanan kavramlar',
    iconClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  {
    id: 'exit_ticket',
    label: 'Öz-Değerlendirme',
    icon: 'fa-ticket',
    desc: 'Duygu durum çıkış bileti',
    iconClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  },
];

export const ModulePalette: React.FC = () => {
  const { addModule, modules } = usePremiumStudioStore();

  return (
    <div className="w-72 bg-[#080808] border-r border-zinc-800 flex flex-col h-full font-lexend z-10 shadow-2xl shrink-0">
      <div className="p-4 border-b border-zinc-900/50">
        <h2 className="text-zinc-200 text-sm font-bold flex items-center gap-2">
          <i className="fa-solid fa-shapes text-amber-500"></i> Bileşen Paleti
        </h2>
        <p className="text-[10px] text-zinc-500 font-medium uppercase mt-1 tracking-widest leading-relaxed">
          Kağıda eklemek istediğiniz modüle tıklayın. Öğrenci için {modules.length} modül seçildi.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-[#030303]">
        {MODULES.map((mod) => (
          <button
            key={mod.id}
            onClick={() => addModule(mod.id)}
            className="w-full text-left p-3 rounded-2xl bg-[#0a0a0a] hover:bg-[#121212] border border-zinc-800/80 hover:border-amber-500/40 transition-all duration-300 group relative overflow-hidden flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_5px_15px_rgba(245,158,11,0.05)]"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110 ${mod.iconClass}`}
            >
              <i className={`fa-solid ${mod.icon} text-lg drop-shadow-md`}></i>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-[11px] font-black text-zinc-300 group-hover:text-amber-500 transition-colors truncate tracking-wide uppercase">
                {mod.label}
              </h3>
              <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {mod.desc}
              </p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <i className="fa-solid fa-plus text-amber-500 text-sm"></i>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-900 bg-[#050505]">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
          <i className="fa-solid fa-circle-info text-indigo-400 mt-0.5"></i>
          <p className="text-[9px] text-indigo-300/80 font-medium leading-relaxed uppercase tracking-wider">
            Bilişsel Yük Teorisine göre bir sayfada en fazla 3 veya 4 farklı modül tipi kullanmanız
            önerilir.
          </p>
        </div>
      </div>
    </div>
  );
};
