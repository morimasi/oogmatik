import React from 'react';
import { GeneratorOptions } from '../../types';

interface Props {
  options: GeneratorOptions;
  onChange: (updates: Partial<GeneratorOptions>) => void;
}

export const EsAnlamliKelimelerConfig: React.FC<Props> = ({ options, onChange }) => {
  const opts = options as Record<string, unknown>;

  const toggle = (key: string, defaultVal = true) =>
    onChange({ [key]: !(opts[key] ?? defaultVal) } as Partial<GeneratorOptions>);

  return (
    <div className="space-y-4">
      {/* topic */}
      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Kelime Teması (Opsiyonel)</label>
        <input
          type="text"
          value={(opts.topic as string) || (options.topic as string) || ''}
          onChange={e => onChange({ topic: e.target.value })}
          placeholder="Örn: Doğa, Spor, Duygular..."
          className="w-full border-2 border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold focus:border-indigo-400 outline-none"
        />
      </div>

      {/* wordCount */}
      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
          Kelime Sayısı: {(opts.wordCount as number) || options.itemCount || 6}
        </label>
        <input
          type="range" min={4} max={12} step={1}
          value={(opts.wordCount as number) || options.itemCount || 6}
          onChange={e => onChange({ wordCount: Number(e.target.value), itemCount: Number(e.target.value) } as Partial<GeneratorOptions>)}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[9px] text-zinc-400 mt-1"><span>4</span><span>12</span></div>
      </div>

      {/* toggles */}
      {[
        { key: 'includeAntonyms', label: 'Zıt Anlamları Dahil Et', desc: 'Her kelime için karşıt anlam', default: true },
        { key: 'includeExamples', label: 'Örnek Cümle Ekle', desc: 'Bağlamlı kullanım cümlesi', default: true },
        { key: 'includeEtymology', label: 'Etimoloji Notu', desc: 'Kısa kelime kökeni açıklaması', default: false },
      ].map(({ key, label, desc, default: def }) => (
        <div key={key} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
          <div>
            <p className="text-sm font-black text-zinc-800">{label}</p>
            <p className="text-[10px] text-zinc-400">{desc}</p>
          </div>
          <button
            onClick={() => toggle(key, def)}
            className={`w-12 h-6 rounded-full transition-all ${(opts[key] ?? def) ? 'bg-indigo-600' : 'bg-zinc-300'} relative shrink-0`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${(opts[key] ?? def) ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      ))}

      {/* layout */}
      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Sayfa Düzeni</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'card_grid', label: 'Kart Grid' },
            { value: 'list', label: 'Liste' },
            { value: 'match_columns', label: 'Eşleştirme' },
          ].map(l => (
            <button
              key={l.value}
              onClick={() => onChange({ layout: l.value } as Partial<GeneratorOptions>)}
              className={`py-2 rounded-xl font-bold text-xs border-2 transition-all ${(opts.layout || 'card_grid') === l.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-zinc-200 text-zinc-600'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
