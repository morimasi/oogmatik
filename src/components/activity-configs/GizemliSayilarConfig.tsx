import React from 'react';
import { GeneratorOptions } from '../../types';

interface GizemliSayilarConfigProps {
  settings: GeneratorOptions;
  onChange: (newSettings: GeneratorOptions) => void;
}

export const GizemliSayilarConfig: React.FC<GizemliSayilarConfigProps> = ({
  settings,
  onChange,
}) => {
  const custom = (settings as any).customSettings || (settings as any).numberLogicRiddles || {};

  const updateCustom = (key: string, value: any) => {
    onChange({
      ...settings,
      customSettings: {
        ...custom,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4 font-['Lexend'] p-1">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 p-3 border border-amber-200/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
            <i className="fa-solid fa-user-secret text-sm"></i>
          </div>
          <div>
            <h4 className="text-xs font-black text-zinc-800">Gizemli Sayılar Ayarları</h4>
            <p className="text-[10px] text-zinc-500 font-medium">Dedektif İpuçları & Sayısal Muhakeme</p>
          </div>
        </div>
        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
          Ultra-Premium
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Zorluk Seviyesi */}
        <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
          <label className="text-[11px] font-black text-zinc-700 flex items-center justify-between">
            <span>Zorluk Seviyesi</span>
            <span className="text-[9px] font-normal text-zinc-400">Sayı Aralığı</span>
          </label>
          <select
            value={settings.difficulty || 'Orta'}
            onChange={(e) => onChange({ ...settings, difficulty: e.target.value as any })}
            className="w-full text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="Kolay">Kolay (10 - 40 Arası)</option>
            <option value="Orta">Orta (20 - 99 Arası)</option>
            <option value="Zor">Zor (100 - 500 Arası)</option>
          </select>
        </div>

        {/* A4 Bulmaca Adedi */}
        <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
          <label className="text-[11px] font-black text-zinc-700 flex items-center justify-between">
            <span>A4 Soru Miktarı</span>
            <span className="text-xs font-black text-amber-600">
              {custom.itemCount || (settings.difficulty === 'Zor' ? 4 : 6)} Soru
            </span>
          </label>
          <input
            type="range"
            min={2}
            max={8}
            step={2}
            value={custom.itemCount || (settings.difficulty === 'Zor' ? 4 : 6)}
            onChange={(e) => updateCustom('itemCount', parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 h-1.5 bg-zinc-100 rounded-lg cursor-pointer"
          />
        </div>

        {/* İpucu Sayısı */}
        <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
          <label className="text-[11px] font-black text-zinc-700 flex items-center justify-between">
            <span>İpucu Karmaşıklığı</span>
            <span className="text-[9px] font-normal text-zinc-400">Kart Başına</span>
          </label>
          <select
            value={custom.clueCount || 3}
            onChange={(e) => updateCustom('clueCount', parseInt(e.target.value, 10))}
            className="w-full text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value={3}>3 İpucu (Standart Dedektif)</option>
            <option value={4}>4 İpucu (Uzman Dedektif)</option>
          </select>
        </div>

        {/* Simgeleri Göster */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
          <div>
            <span className="text-[11px] font-black text-zinc-700 block">İpucu İkonları</span>
            <span className="text-[9px] text-zinc-400 font-medium">Görsel destek ekler</span>
          </div>
          <button
            type="button"
            onClick={() => updateCustom('showIcons', custom.showIcons === false ? true : false)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${custom.showIcons !== false ? 'bg-amber-500' : 'bg-zinc-300'
              }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${custom.showIcons !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GizemliSayilarConfig;
