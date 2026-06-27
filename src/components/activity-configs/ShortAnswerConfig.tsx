import React from 'react';
import { GeneratorOptions } from '../../types';

export const ShortAnswerConfig = ({
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
            className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg transition-all ${
              selected === opt.value
                ? 'bg-[var(--accent-color)] text-white shadow-md'
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
      <div className="bg-[var(--surface-paper)] rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl">
          <div className="p-4 bg-[var(--accent-muted)] border-b border-[var(--accent-color)]/10">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--accent-color)] flex items-center justify-center shadow-lg">
                      <i className="fa-solid fa-graduation-cap text-white text-xl"></i>
                  </div>
                  <div>
                      <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">SINAV STÜDYOSU</h4>
                      <p className="text-[9px] text-[var(--text-muted)] font-medium">Kısa Cevaplı & Açık Uçlu Soru Tasarımcısı</p>
                  </div>
              </div>
          </div>

          <div className="p-4 space-y-5">
              {/* Tema Girişi */}
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-book-open text-[var(--accent-color)]"></i> SORU TEMASI / KONU
                  </label>
                  <input
                    type="text"
                    value={(opts.topic as string) || ''}
                    onChange={(e) => onChange('topic', e.target.value)}
                    placeholder="Türkçe, Fen Bilimleri, Genel Kültür..."
                    className="w-full p-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl text-xs font-bold text-[var(--text-primary)] placeholder:opacity-40 focus:border-[var(--accent-color)] transition-all outline-none shadow-inner"
                  />
              </div>

              {/* Grid Ayarlar */}
              <div className="flex flex-col md:flex-row gap-4">
                  <ToggleGroup
                    label="Zorluk Derecesi"
                    icon="fa-signal"
                    selected={options.difficulty || 'Orta'}
                    onChange={(v: string) => onChange('difficulty', v)}
                    options={[
                        { value: 'Kolay', label: 'BAŞLANGIÇ' },
                        { value: 'Orta', label: 'ORTA' },
                        { value: 'Zor', label: 'İLERİ' }
                    ]}
                  />

                  <ToggleGroup
                    label="Cevap Alanı"
                    icon="fa-pen-clip"
                    selected={(opts.lineStyle as string) || 'single'}
                    onChange={(v: string) => onChange('lineStyle' as keyof GeneratorOptions, v)}
                    options={[
                        { value: 'single', label: 'ÇİZGİLİ' },
                        { value: 'square', label: 'KARELİ' },
                        { value: 'blank', label: 'BOŞ' }
                    ]}
                  />
              </div>

              {/* Slider Ayarları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[var(--surface-glass)] rounded-2xl border border-[var(--border-color)]/50">
                  <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                          <label className="text-[9px] font-black text-[var(--text-muted)] uppercase">SORU SAYISI</label>
                          <span className="text-[11px] font-black text-[var(--accent-color)]">{(opts.itemCountShort as number) || 12}</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="24"
                        value={(opts.itemCountShort as number) || 12}
                        onChange={(e) => onChange('itemCountShort' as keyof GeneratorOptions, parseInt(e.target.value))}
                        className="w-full accent-[var(--accent-color)] h-1.5"
                      />
                  </div>

                  <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                          <label className="text-[9px] font-black text-[var(--text-muted)] uppercase">CEVAP SATIRI</label>
                          <span className="text-[11px] font-black text-[var(--accent-color)]">{(opts.answerLineCount as number) || 3}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        value={(opts.answerLineCount as number) || 3}
                        onChange={(e) => onChange('answerLineCount' as keyof GeneratorOptions, parseInt(e.target.value))}
                        className="w-full accent-[var(--accent-color)] h-1.5"
                      />
                  </div>
              </div>

              {/* Ek Özellikler Toggle */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                   {[
                       { key: 'includePoints', label: 'PUANLAMA', icon: 'fa-star' },
                       { key: 'includeHints', label: 'İPUCU KARTLARI', icon: 'fa-id-card' }
                   ].map(item => (
                       <button
                         key={item.key}
                         onClick={() => onChange(item.key as keyof GeneratorOptions, !(opts[item.key] as boolean))}
                         className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                            opts[item.key] !== false ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-lg' : 'bg-[var(--surface-glass)] border-[var(--border-color)]'
                         }`}
                       >
                           <i className={`fa-solid ${item.icon} text-[10px] ${opts[item.key] !== false ? 'text-white' : 'text-[var(--text-muted)]'}`}></i>
                           <span className={`text-[10px] font-black uppercase tracking-tight ${opts[item.key] !== false ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                               {item.label}
                           </span>
                       </button>
                   ))}
              </div>
          </div>
      </div>
    </div>
  );
};
