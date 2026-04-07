import React from 'react';
import { GeneratorOptions } from '../../types';

interface Props {
  options: GeneratorOptions;
  onChange: (updates: Partial<GeneratorOptions>) => void;
}

export const KavramHaritasiConfig: React.FC<Props> = ({ options, onChange }) => {
  const opts = options as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
          Merkez Kavram <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={(opts.concept as string) || (options.topic as string) || ''}
          onChange={e => onChange({ concept: e.target.value, topic: e.target.value })}
          placeholder="Örn: Su Döngüsü, Fotosentez..."
          className="w-full border-2 border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold focus:border-indigo-400 outline-none"
        />
      </div>

      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Dal Derinliği</label>
        <div className="flex gap-2">
          {[1, 2, 3].map(d => (
            <button
              key={d}
              onClick={() => onChange({ depth: d } as Partial<GeneratorOptions>)}
              className={`flex-1 py-2 rounded-xl font-black text-sm border-2 transition-all ${
                ((opts.depth as number) || 2) === d
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white border-zinc-200 text-zinc-600'
              }`}
            >
              {d} Seviye
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
          Ana Dal Sayısı: {(opts.branchCount as number) || 4}
        </label>
        <input
          type="range"
          min={2}
          max={6}
          step={1}
          value={(opts.branchCount as number) || 4}
          onChange={e => onChange({ branchCount: Number(e.target.value) } as Partial<GeneratorOptions>)}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[9px] text-zinc-400 mt-1">
          <span>2 Dal</span>
          <span>6 Dal</span>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
          Boş Kutu Oranı: %{Math.round(((opts.fillRatio as number) ?? 0.4) * 100)}
        </label>
        <input
          type="range"
          min={0}
          max={0.8}
          step={0.1}
          value={(opts.fillRatio as number) ?? 0.4}
          onChange={e => onChange({ fillRatio: Number(e.target.value) } as Partial<GeneratorOptions>)}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[9px] text-zinc-400 mt-1">
          <span>Tamamen Dolu</span>
          <span>Çoğunluk Boş</span>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Yerleşim</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'radial', label: 'Radyal' },
            { value: 'tree', label: 'Ağaç' },
            { value: 'spider', label: 'Örümcek' },
          ].map(l => (
            <button
              key={l.value}
              onClick={() => onChange({ layout: l.value } as Partial<GeneratorOptions>)}
              className={`py-2 rounded-xl font-bold text-xs border-2 transition-all ${
                ((opts.layout as string) || 'radial') === l.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white border-zinc-200 text-zinc-600'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
        <div>
          <p className="text-sm font-black text-zinc-800">Örnekleri Göster</p>
          <p className="text-[10px] text-zinc-400">Kavram için örnek ifadeler ekle</p>
        </div>
        <button
          onClick={() => onChange({ showExamples: !((opts.showExamples as boolean) ?? true) } as Partial<GeneratorOptions>)}
          className={`w-12 h-6 rounded-full transition-all relative ${
            (opts.showExamples as boolean) ?? true ? 'bg-indigo-600' : 'bg-zinc-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
              (opts.showExamples as boolean) ?? true ? 'left-6' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
