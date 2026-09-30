import React from 'react';
import { GeneratorOptions } from '../../types';

interface ConfigProps {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const NumberPatternConfig = ({ options, onChange }: ConfigProps) => {
  const o = (options as any).numberPattern || {};

  const update = (key: string, val: unknown) => {
    onChange('numberPattern' as any, { ...o, [key]: val });
    onChange(key as any, val);
  };

  const problemCount = o.problemCount || options.problemCount || 8;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] dark:border-[var(--accent-color)]">
        <h4 className="text-xs font-black text-[var(--accent-color)] dark:text-[var(--accent-color)] uppercase tracking-widest mb-3">
          <i className="fa-solid fa-arrow-trend-up mr-1 text-[var(--accent-color)]"></i> Sayı Örüntü Ayarları
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Örüntü Türü */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
              Örüntü Kuralları
            </label>
            <select
              value={o.patternKind || options.patternKind || 'mixed'}
              onChange={(e) => update('patternKind', e.target.value)}
              className="w-full bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--accent-color)] border-[var(--border-color)] rounded-xl p-2 text-xs font-bold text-[var(--text-muted)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
            >
              <option value="mixed">Karma Örüntüler (Tümü)</option>
              <option value="add">Artan (+N Adımlar)</option>
              <option value="subtract">Azalan (-N Adımlar)</option>
              <option value="multiply">Katlı (×N Çarpanlı)</option>
              <option value="fibonacci">Fibonacci (Toplamlı)</option>
            </select>
          </div>

          {/* Zorluk */}
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
              Zorluk Derecesi
            </label>
            <select
              value={options.difficulty || 'Orta'}
              onChange={(e) => onChange('difficulty', e.target.value)}
              className="w-full bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--accent-color)] border-[var(--border-color)] rounded-xl p-2 text-xs font-bold text-[var(--text-muted)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)]"
            >
              <option value="Kolay">Kolay (Küçük Adımlar)</option>
              <option value="Orta">Orta (Dengeli Adımlar)</option>
              <option value="Zor">Zor (Büyük Sayılar/Katlar)</option>
            </select>
          </div>
        </div>

        {/* Soru Miktarı Slider */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">
            <span>A4 Dizi Miktarı</span>
            <span className="text-[var(--accent-color)] font-black">{problemCount} Örüntü</span>
          </div>
          <input
            type="range"
            min={4}
            max={12}
            step={2}
            value={problemCount}
            onChange={(e) => update('problemCount', parseInt(e.target.value))}
            className="w-full accent-[var(--accent-color)] h-1.5 bg-[var(--surface-elevated)] rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* İpucu Gösterim Seçenekleri */}
      <div className="space-y-2">
        <div
          className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] cursor-pointer"
          onClick={() => update('showRuleClue', o.showRuleClue === false ? true : false)}
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[var(--text-primary)]">Örüntü İpucu Çizgisi</span>
            <span className="text-[9px] text-[var(--text-muted)]">Örüntü altında kural yazma çizgisini göster</span>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${o.showRuleClue !== false ? 'bg-[var(--accent-color)]' : 'bg-[var(--surface-elevated)]'}`}>
            <div className={`w-3.5 h-3.5 bg-[var(--bg-paper)] rounded-full absolute top-0.75 transition-transform ${o.showRuleClue !== false ? 'left-5.5' : 'left-0.75'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
