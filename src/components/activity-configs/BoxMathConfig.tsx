// BoxMathConfig: Premium configuration for math box activities
import React from 'react';
import { GeneratorOptions } from '../../types';

interface Props {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: any) => void;
}

export const BoxMathConfig: React.FC<Props> = ({ options, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mod Seçimi */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Çalışma Türü
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                id: 'reverse',
                label: 'Ters İşlem',
                icon: 'fa-rotate-left',
                desc: '□ değerini bul',
              },
              {
                id: 'substitution',
                label: 'Yerine Koyma',
                icon: 'fa-box-open',
                desc: 'Sayıyı yerine koy',
              },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => onChange('variant', v.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${options.variant === v.id ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200'}`}
              >
                <i className={`fa-solid ${v.icon} text-lg`}></i>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase leading-none">{v.label}</p>
                  <p className="text-[8px] font-bold opacity-60 mt-1">{v.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Soru Sayısı */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Soru Kapasitesi
          </label>
          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
            <input
              type="range"
              min="6"
              max="24"
              step="2"
              value={options.itemCount}
              onChange={(e) => onChange('itemCount', parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-black text-zinc-300">6</span>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                {options.itemCount}
              </span>
              <span className="text-[10px] font-black text-zinc-300">24</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zorluk ve Sayı Aralığı */}
      <div className="p-4 bg-zinc-50 rounded-[2rem] border border-zinc-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs shadow-lg">
            <i className="fa-solid fa-gauge-high"></i>
          </div>
          <div>
            <h4 className="text-xs font-black text-zinc-800 uppercase">Bilişsel Seviye</h4>
            <p className="text-[9px] font-bold text-zinc-400 leading-none">
              İşlem karmaşıklığını belirle
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['Başlangıç', 'Orta', 'Zor', 'Uzman'].map((d) => (
            <button
              key={d}
              onClick={() => onChange('difficulty', d as any)}
              className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${options.difficulty === d ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-white bg-white text-zinc-400 hover:border-zinc-200'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Punto Ayarı */}
      <div className="p-4 bg-zinc-50 rounded-[2rem] border border-zinc-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs shadow-lg">
            <i className="fa-solid fa-text-height"></i>
          </div>
          <div>
            <h4 className="text-xs font-black text-zinc-800 uppercase">Punto (Yazı Boyutu)</h4>
            <p className="text-[9px] font-bold text-zinc-400 leading-none">
              Kutu ve ifade büyüklüğünü ayarla
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'small',  label: 'Küçük', icon: 'fa-font',       desc: 'Kompakt' },
            { id: 'medium', label: 'Orta',  icon: 'fa-font',       desc: 'Standart' },
            { id: 'large',  label: 'Büyük', icon: 'fa-font',       desc: 'Geniş Kutu' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => onChange('fontSizePreference', v.id as any)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${(options.fontSizePreference ?? 'medium') === v.id ? 'border-violet-500 bg-violet-50 text-violet-600 shadow-sm' : 'border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200'}`}
            >
              <i className={`fa-solid ${v.icon} ${v.id === 'small' ? 'text-sm' : v.id === 'large' ? 'text-xl' : 'text-base'}`}></i>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase leading-none">{v.label}</p>
                <p className="text-[8px] font-bold opacity-60 mt-0.5">{v.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
