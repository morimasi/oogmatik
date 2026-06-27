import React from 'react';
import { GeneratorOptions } from '../../types';

export const AdvancedMissingPartsConfig = ({
  options,
  onChange,
}: {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}) => {
  const opts = options as Record<string, unknown>;

  const ToggleGroup = ({ label, icon, selected, onChange, options }: any) => (
    <div className="space-y-1.5 flex-1">
      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5 px-1">
        {icon && <i className={`fa-solid ${icon} text-[var(--accent-color)]`} />}
        {label}
      </label>
      <div className="flex bg-[var(--surface-elevated)] p-1 rounded-xl border border-[var(--border-color)] shadow-inner">
        {options.map((opt: any) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 px-2 text-[10px] font-bold rounded-lg transition-all ${
              selected === opt.value
                ? 'bg-[var(--accent-color)] text-white shadow-md scale-[1.02]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* İnovatif Akıllı Panel */}
      <div className="bg-[var(--surface-paper)] rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl">
          <div className="p-4 bg-[var(--accent-muted)] border-b border-[var(--accent-color)]/10">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--accent-color)] flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-pen-nib text-white text-xl"></i>
                  </div>
                  <div>
                      <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">DİL BİLGİSİ STÜDYOSU</h4>
                      <p className="text-[9px] text-[var(--text-muted)] font-medium">Eksik Parçaları Tamamlama & Cloze Test</p>
                  </div>
              </div>
          </div>

          <div className="p-4 space-y-5">
              {/* Tema Girişi */}
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-earth-americas text-[var(--accent-color)]"></i> METİN TEMASI
                  </label>
                  <input
                    type="text"
                    value={(opts.topic as string) || ''}
                    onChange={(e) => onChange('topic', e.target.value)}
                    placeholder="Bilim, Tarih, Doğa, Uzay..."
                    className="w-full p-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl text-xs font-bold text-[var(--text-primary)] placeholder:opacity-50 focus:border-[var(--accent-color)] transition-all outline-none shadow-inner"
                  />
              </div>

              {/* Grid Ayarlar */}
              <div className="flex flex-col md:flex-row gap-4">
                  <ToggleGroup
                    label="Zorluk Derecesi"
                    icon="fa-gauge-high"
                    selected={options.difficulty || 'Orta'}
                    onChange={(v: string) => onChange('difficulty', v)}
                    options={[
                        { value: 'Kolay', label: 'BAŞLANGIÇ' },
                        { value: 'Orta', label: 'ORTA' },
                        { value: 'Zor', label: 'İLERİ' }
                    ]}
                  />

                  <ToggleGroup
                    label="Eksik Türü"
                    icon="fa-scissors"
                    selected={(opts.blankType as string) || 'word'}
                    onChange={(v: string) => onChange('blankType' as keyof GeneratorOptions, v)}
                    options={[
                        { value: 'word', label: 'SÖZCÜK' },
                        { value: 'phrase', label: 'ÖBEK' },
                        { value: 'syllable', label: 'HECE' }
                    ]}
                  />
              </div>

              {/* Slider Ayarları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[var(--surface-glass)] rounded-2xl border border-[var(--border-color)]/50">
                  <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                          <label className="text-[9px] font-black text-[var(--text-muted)] uppercase">MADDE SAYISI</label>
                          <span className="text-[11px] font-black text-[var(--accent-color)]">{(opts.blankCount as number) || 8}</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="20"
                        value={(opts.blankCount as number) || 8}
                        onChange={(e) => onChange('blankCount' as keyof GeneratorOptions, parseInt(e.target.value))}
                        className="w-full accent-[var(--accent-color)] h-1.5"
                      />
                  </div>

                  <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                          <label className="text-[9px] font-black text-[var(--text-muted)] uppercase">DOLULUK ORANI</label>
                          <span className="text-[11px] font-black text-[var(--accent-color)]">{(opts.fillRatio as number) || 60}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="10"
                        value={(opts.fillRatio as number) || 60}
                        onChange={(e) => onChange('fillRatio' as keyof GeneratorOptions, parseInt(e.target.value))}
                        className="w-full accent-[var(--accent-color)] h-1.5"
                      />
                  </div>
              </div>
          </div>
      </div>

      {/* Profesyonel Öneriler */}
      <div className="p-4 bg-[var(--accent-color)]/5 rounded-2xl border border-[var(--accent-color)]/10 border-dashed">
          <div className="flex gap-3">
              <i className="fa-solid fa-wand-magic-sparkles text-[var(--accent-color)] text-sm"></i>
              <p className="text-[10px] font-medium text-[var(--text-primary)] leading-relaxed italic opacity-80">
                  <span className="font-black">İpucu:</span> "Hece" modunu seçerseniz her kelimenin rastgele bir hecesi eksik bırakılır, bu da disleksi egzersizleri için mükemmeldir.
              </p>
          </div>
      </div>
    </div>
  );
};
