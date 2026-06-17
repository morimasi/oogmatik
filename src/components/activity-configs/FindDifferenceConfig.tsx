import React from 'react';
import { GeneratorOptions } from '../../types';

export const FindDifferenceConfig: React.FC<{
  options: GeneratorOptions;
  onChange: (k: keyof GeneratorOptions, v: unknown) => void;
}> = ({ options, onChange }) => {
  const o = (options as any).findDifference || {};
  
  const update = (updates: Record<string, any>) => {
    onChange('findDifference' as any, { ...o, ...updates });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-4">
      <div className="pb-3 border-b border-zinc-100">
        <h4 className="font-black text-rose-900 uppercase tracking-tight text-lg">Farkı Bul Atölyesi</h4>
        <p className="text-[10px] text-zinc-500 font-medium">Görsel dikkat ve ayrıştırma analizi</p>
      </div>

      <div className="p-4 bg-rose-50/50 rounded-[2rem] border border-rose-100">
        <label className="text-[10px] font-black text-rose-600 uppercase mb-3 block text-center tracking-widest">
          İçerik Varyantı
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: 'char', l: 'Harfler', i: 'fa-font' },
            { v: 'number', l: 'Sayılar', i: 'fa-hashtag' },
            { v: 'word', l: 'Kelimeler', i: 'fa-align-left' },
            { v: 'visual', l: 'Semboller', i: 'fa-shapes' },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => update({ findDiffType: t.v })}
              className={`py-3 rounded-xl text-[10px] font-black border transition-all flex flex-col items-center gap-1 ${
                (o.findDiffType || 'visual') === t.v 
                ? 'bg-rose-600 text-white border-rose-600 shadow-lg' 
                : 'bg-white text-zinc-500 border-zinc-100 hover:border-rose-200'
              }`}
            >
              <i className={`fa-solid ${t.i} text-xs`}></i>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Izgara Boyutu (N x N)</label>
          <div className="grid grid-cols-4 gap-2">
            {[4, 5, 6, 8, 10].map((n) => (
              <button
                key={n}
                onClick={() => update({ gridSize: n })}
                className={`py-2 rounded-lg text-xs font-black border transition-all ${
                  (o.gridSize || 5) === n 
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' 
                  : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300'
                }`}
              >
                {n}x{n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Hedef Fark Sayısı</label>
          <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
             <input
               type="range"
               min={1}
               max={15}
               value={o.itemCount || 5}
               onChange={(e) => update({ itemCount: parseInt(e.target.value) })}
               className="flex-1 accent-rose-600"
             />
             <span className="w-8 text-center font-black text-rose-600 text-sm">{o.itemCount || 5}</span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase mb-2">Zorluk Seviyesi</label>
          <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            {['Başlangıç', 'Orta', 'Zor'].map((l) => (
              <button
                key={l}
                onClick={() => onChange('difficulty', l)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                  options.difficulty === l ? 'bg-white text-rose-600 shadow-sm' : 'text-zinc-500'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2">
         <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl cursor-pointer border border-zinc-100 hover:bg-white transition-all">
            <input 
                type="checkbox" 
                checked={o.layout === 'side_by_side'} 
                onChange={(e) => update({ layout: e.target.checked ? 'side_by_side' : 'rows' })}
                className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 border-zinc-300"
            />
            <span className="text-sm font-bold text-zinc-700">Tabloları Yan Yana Göster</span>
         </label>
      </div>
    </div>
  );
};

