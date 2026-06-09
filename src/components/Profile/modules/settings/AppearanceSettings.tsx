import React from 'react';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { ToggleSwitch } from '../../components/shared/ToggleSwitch';
import type { AppearanceSettingsProps } from '../../types';
import type { AppTheme } from '../../../../types';

const THEMES: { name: string; id: AppTheme; color: string; border?: boolean }[] = [
    { name: 'Antrasit Pro', id: 'anthracite', color: 'bg-[#1a1a1a]' },
    { name: 'Okyanus', id: 'ocean', color: 'bg-blue-600' },
    { name: 'Işık Kaplı', id: 'light', color: 'bg-white', border: true },
    { name: 'Uzay Gezgini', id: 'space', color: 'bg-slate-900' },
    { name: 'Doğa', id: 'nature', color: 'bg-emerald-600' },
    { name: 'OLED Siyah', id: 'oled-black', color: 'bg-black' },
    { name: 'Krem (Disleksi)', id: 'dyslexia-cream', color: 'bg-amber-50', border: true },
    { name: 'Nane (Disleksi)', id: 'dyslexia-mint', color: 'bg-emerald-50', border: true },
];

const DENSITIES = [
    { id: 'comfortable', label: 'Ferah Mod', icon: 'fa-square' },
    { id: 'compact', label: 'Kompakt Mod', icon: 'fa-list-ul' },
] as const;

const RADIUS_OPTIONS = [
    { id: 'none', label: 'Keskin' },
    { id: 'sm', label: 'Yumuşak' },
    { id: 'xl', label: 'Yuvarlak' },
    { id: 'full', label: 'Tam Oval' },
] as const;

const ANIMATION_LEVELS = [
    { id: 'full', label: 'Tam', desc: 'Tüm animasyonlar aktif' },
    { id: 'reduced', label: 'Azaltılmış', desc: 'Sadece geçişler' },
    { id: 'none', label: 'Kapalı', desc: 'Erişilebilirlik modu' },
] as const;

const FONT_WEIGHTS = [
    { id: 'thin', label: 'İnce', weight: 300 },
    { id: 'normal', label: 'Normal', weight: 400 },
    { id: 'medium', label: 'Orta', weight: 500 },
    { id: 'bold', label: 'Kalın', weight: 700 },
    { id: 'black', label: 'Siyah', weight: 900 },
] as const;

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
    theme,
    uiSettings,
    onUpdateTheme,
    onUpdateUiSettings,
}) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Tema Seçimi */}
            <div>
                <SectionHeader title="Görsel Tema Stili" icon="fa-palette" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {THEMES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => onUpdateTheme?.(t.id)}
                            className={`p-3.5 rounded-2xl border-2 transition-all group ${theme === t.id
                                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10'
                                : 'border-transparent bg-[var(--bg-secondary)] hover:border-indigo-200 dark:hover:border-indigo-800'
                                }`}
                        >
                            <div className={`w-full h-10 ${t.color} ${t.border ? 'border border-zinc-200' : ''} rounded-xl mb-2 shadow-md group-hover:scale-105 transition-transform`} />
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-primary)]">{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Arayüz Yerleşimi */}
            <div className="p-5 bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)]">
                <SectionHeader title="Arayüz Yoğunluğu" icon="fa-compress" />
                <div className="flex gap-3">
                    {DENSITIES.map(d => (
                        <button
                            key={d.id}
                            onClick={() => onUpdateUiSettings?.({ ...(uiSettings || {} as any), compactMode: d.id === 'compact' })}
                            className={`flex-1 p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${(uiSettings?.compactMode ? 'compact' : 'comfortable') === d.id
                                ? 'border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                                : 'border-transparent bg-[var(--bg-paper)] text-[var(--text-muted)] hover:border-indigo-200'
                                }`}
                        >
                            <i className={`fa-solid ${d.icon} text-lg`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{d.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Köşe Yuvarlaklığı */}
            <div className="p-5 bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)]">
                <SectionHeader title="Köşe Yuvarlaklığı" icon="fa-vector-square" />
                <div className="flex gap-2">
                    {RADIUS_OPTIONS.map(r => (
                        <button
                            key={r.id}
                            className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[var(--bg-paper)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-all border border-[var(--border-color)]"
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Animasyon Tercihi */}
            <div className="p-5 bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)]">
                <SectionHeader title="Animasyon Düzeyi" icon="fa-wand-sparkles" description="Erişilebilirlik için animasyonları azaltabilirsiniz" />
                <div className="grid grid-cols-3 gap-2">
                    {ANIMATION_LEVELS.map(a => (
                        <button
                            key={a.id}
                            className="p-4 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-indigo-300 transition-all text-center"
                        >
                            <span className="block text-xs font-black text-[var(--text-primary)] mb-1">{a.label}</span>
                            <span className="block text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{a.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Ayarları */}
            <div className="p-5 bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)]">
                <SectionHeader title="Tipografi Kontrolleri" icon="fa-font" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Font Boyutu Ölçeği</label>
                        <input
                            type="range"
                            min="80"
                            max="140"
                            value={(uiSettings?.fontSizeScale ?? 100)}
                            onChange={(e) => onUpdateUiSettings?.({ ...(uiSettings || {} as any), fontSizeScale: Number(e.target.value) })}
                            className="w-full h-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between mt-1 px-1">
                            <span className="text-[8px] font-black text-zinc-400 uppercase">Küçük</span>
                            <span className="text-[8px] font-black text-indigo-600 uppercase">%{uiSettings?.fontSizeScale ?? 100}</span>
                            <span className="text-[8px] font-black text-zinc-400 uppercase">Büyük</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Satır Aralığı</label>
                        <input
                            type="range"
                            min="140"
                            max="200"
                            step="10"
                            value={(uiSettings?.lineHeight ?? 1.6) * 100}
                            onChange={(e) => onUpdateUiSettings?.({ ...(uiSettings || {} as any), lineHeight: Number(e.target.value) / 100 })}
                            className="w-full h-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between mt-1 px-1">
                            <span className="text-[8px] font-black text-zinc-400 uppercase">Sıkı</span>
                            <span className="text-[8px] font-black text-indigo-600 uppercase">{uiSettings?.lineHeight ?? 1.6}</span>
                            <span className="text-[8px] font-black text-zinc-400 uppercase">Geniş</span>
                        </div>
                    </div>
                </div>

                {/* Font Kalınlığı */}
                <div className="mt-5">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">Yazı Kalınlığı</label>
                    <div className="flex gap-2">
                        {FONT_WEIGHTS.map((w) => (
                            <button
                                key={w.id}
                                onClick={() => onUpdateUiSettings?.({ ...(uiSettings || {} as any), fontWeight: w.id as any })}
                                className={`flex-1 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all border ${
                                    (uiSettings?.fontWeight ?? 'normal') === w.id
                                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-muted)] hover:border-indigo-300'
                                }`}
                                style={{ fontWeight: w.weight }}
                            >
                                <span className="block text-lg mb-0.5" style={{ fontWeight: w.weight }}>Aa</span>
                                {w.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
