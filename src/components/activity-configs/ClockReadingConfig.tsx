import React from 'react';
import { GeneratorOptions } from '../../types';

const variantMeta = {
  'analog-to-digital': {
    label: 'Analog → Dijital',
    icon: 'fa-clock',
    desc: 'Saat görseline bak, dijital yaz',
    subs: [
      { v: 'standard', l: 'Standart (Tüm Kollar)' },
      { v: 'no-minute', l: 'Sadece Akrep (Zor)' },
      { v: 'no-hour', l: 'Sadece Yelkovan (Zor)' },
    ],
  },
  'digital-to-analog': {
    label: 'Dijital → Çizim',
    icon: 'fa-pen',
    desc: 'Dijital saate bak, akrep/yelkovan çiz',
    subs: [
      { v: 'full', l: 'Tam Kadran' },
      { v: 'numbers-only', l: 'Sadece Rakamlar' },
      { v: 'blank', l: 'Boş Kadran (Zor)' },
    ],
  },
  'verbal-match': {
    label: 'Sözel Eşleştirme',
    icon: 'fa-font',
    desc: 'Sözel ifadeyi doğru saatle eşleştir',
    subs: [
      { v: '4-options', l: '4 Seçenekli' },
      { v: '6-options', l: '6 Seçenekli (Zor)' },
    ],
  },
} as const;

export const ClockReadingConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: string, v: unknown) => void }) => {
  const variant = (options.variant || 'analog-to-digital') as keyof typeof variantMeta;
  const subVariant = (options as Record<string, unknown>).subVariant as string || 'standard';
  const mixedMode = (options as Record<string, unknown>).mixedMode === true;
  const includeElapsed = (options as Record<string, unknown>).includeElapsed === true;
  const includeRoutine = (options as Record<string, unknown>).includeRoutine === true;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ÇALIŞMA TİPİ - Premium */}
      <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-900/10 dark:to-amber-800/5 rounded-[2rem] border border-amber-200/70 dark:border-amber-700/30 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-200/50 dark:border-amber-700/30">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <i className="fa-solid fa-gear text-[var(--text-primary)] text-xs"></i>
          </div>
          <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
            Çalışma Tipi
          </span>
          <span className="ml-auto text-[7px] font-bold text-amber-400 uppercase bg-amber-100/50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
            Premium
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(variantMeta) as [string, typeof variantMeta['analog-to-digital']][]).map(([key, meta]) => {
            const isActive = variant === key;
            return (
              <button
                key={key}
                onClick={() => { onChange('variant', key); onChange('subVariant', meta.subs[0].v); }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-bold border-2 transition-all ${
                  isActive
                    ? 'border-amber-500 bg-amber-100/80 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 shadow-md'
                    : 'border-[var(--border-color)] bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-amber-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-amber-500 text-[var(--text-primary)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
                  <i className={`fa-solid ${meta.icon} text-sm`}></i>
                </div>
                <span className="text-[9px] font-black leading-tight text-center">{meta.label}</span>
                <span className="text-[7px] font-medium text-[var(--text-muted)] text-[var(--text-primary)] text-center leading-tight">{meta.desc}</span>
                {isActive && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                    <i className="fa-solid fa-check text-[var(--text-primary)] text-[6px]"></i>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-variant selection */}
        <div className="mt-3 p-3 bg-white/70 bg-[var(--bg-secondary)] rounded-xl border border-amber-200/50 dark:border-amber-700/30">
          <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-2">
            Alt Seçenek
          </span>
          <div className="flex gap-1.5">
            {variantMeta[variant].subs.map((sub) => (
              <button
                key={sub.v}
                onClick={() => onChange('subVariant', sub.v)}
                className={`flex-1 py-1.5 rounded-lg text-[8px] font-bold border transition-all ${
                  subVariant === sub.v
                    ? 'bg-amber-500 text-[var(--text-primary)] border-amber-500 shadow-sm'
                    : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[var(--text-primary)] border-[var(--border-color)]'
                }`}
              >
                {sub.l}
              </button>
            ))}
          </div>
        </div>

        {/* Premium Bonus Features */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[
            { k: 'includeElapsed', l: '⏱ Zaman Farkı', d: 'Geçen süre problemleri' },
            { k: 'includeRoutine', l: '📅 Günlük Rutin', d: 'Zaman çizelgesi' },
            { k: 'mixedMode', l: '🔀 Karışık', d: 'Tüm tipler karışık' },
          ].map((item) => {
            const isOn = item.k === 'mixedMode' ? mixedMode : item.k === 'includeElapsed' ? includeElapsed : includeRoutine;
            return (
              <button
                key={item.k}
                onClick={() => onChange(item.k, !isOn)}
                className={`p-2 rounded-xl text-[8px] font-bold border transition-all text-center ${
                  isOn
                    ? 'bg-amber-500/10 border-amber-400 text-amber-700 dark:text-amber-300'
                    : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'
                }`}
              >
                <span className="block">{item.l}</span>
                <span className="text-[6px] font-medium text-[var(--text-muted)] hidden">{item.d}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hassasiyet */}
      <div className="p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] dark:border-[var(--accent-color)]">
        <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-3 block text-center">Hassasiyet (Zorluk)</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: '30-min', l: '30 Dakika' },
            { v: '15-min', l: '15 Dakika' },
            { v: '5-min', l: '5 Dakika' },
            { v: '1-min', l: '1 Dakika' },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => onChange('precision', t.v)}
              className={`w-full py-2 rounded-xl text-[10px] font-black border transition-all ${
                ((options as Record<string, unknown>).precision || '15-min') === t.v
                  ? 'bg-[var(--accent-color)] text-[var(--text-primary)] border-[var(--accent-color)] shadow-sm'
                  : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Saat Sayısı */}
      <div className="p-4 bg-[var(--accent-muted)] dark:bg-emerald-900/10 rounded-[2rem] border border-[var(--border-color)] dark:border-emerald-800/30">
        <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-3 block text-center">Saat Sayısı</label>
        <div className="flex gap-2">
          {[8, 12, 16].map((count) => (
            <button
              key={count}
              onClick={() => onChange('itemCount', count)}
              className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                (options.itemCount || 12) === count
                  ? 'bg-emerald-500 text-[var(--text-primary)] border-emerald-500 shadow-sm'
                  : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Kadran Detayları */}
      <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-3">
        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Kadran Detayları</h4>
        {[
          { k: 'showNumbers', l: 'Rakamları Göster' },
          { k: 'showTicks', l: 'Dakika Çizgileri' },
          { k: 'is24Hour', l: '24 Saat Formatı' },
        ].map((item) => (
          <div key={item.k} className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)]">{item.l}</span>
            <div
              className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${(options as Record<string, unknown>)[item.k] !== false ? 'bg-[var(--accent-color)]' : 'bg-[var(--surface-elevated)] bg-[var(--bg-secondary)]'}`}
              onClick={() => onChange(item.k, (options as Record<string, unknown>)[item.k] === false)}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 bg-[var(--bg-paper)] rounded-full transition-all ${(options as Record<string, unknown>)[item.k] !== false ? 'left-4.5' : 'left-0.5'}`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
