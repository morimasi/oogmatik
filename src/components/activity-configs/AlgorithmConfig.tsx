
import React from 'react';
import { GeneratorOptions } from '../../types';

// ─── Sabit Veriler ──────────────────────────────────────────────────────────

const CATEGORIES = [
    { id: 'günlük_yaşam', label: 'Günlük Yaşam', icon: 'fa-house-chimney', color: 'emerald' },
    { id: 'matematik',    label: 'Matematik',    icon: 'fa-calculator',    color: 'indigo'  },
    { id: 'fen',          label: 'Fen',          icon: 'fa-flask',         color: 'violet'  },
    { id: 'sosyal',       label: 'Sosyal',       icon: 'fa-people-group',  color: 'amber'   },
    { id: 'teknoloji',    label: 'Teknoloji',    icon: 'fa-microchip',     color: 'sky'     },
] as const;

const ALGORITHM_TYPES = [
    {
        id: 'lineer',
        label: 'Lineer',
        desc: 'Adım adım düz akış',
        icon: 'fa-arrow-down',
        color: 'from-indigo-500 to-blue-500',
    },
    {
        id: 'dallanmalı',
        label: 'Dallanmalı',
        desc: 'Karar noktaları ile',
        icon: 'fa-code-branch',
        color: 'from-amber-500 to-orange-500',
    },
    {
        id: 'döngüsel',
        label: 'Döngüsel',
        desc: 'Tekrar eden döngü',
        icon: 'fa-rotate',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        id: 'paralel',
        label: 'Paralel',
        desc: 'Eş zamanlı süreçler',
        icon: 'fa-grip-lines-vertical',
        color: 'from-violet-500 to-purple-500',
    },
] as const;

const COLOR_THEMES = [
    { id: 'varsayılan', label: 'Klasik',  dot: '#1e293b' },
    { id: 'okyanus',   label: 'Okyanus', dot: '#0ea5e9' },
    { id: 'orman',     label: 'Orman',   dot: '#22c55e' },
    { id: 'şeker',     label: 'Şeker',   dot: '#ec4899' },
] as const;

const AGE_GROUPS = ['5-7', '8-10', '11-13', '14+'] as const;

// ─── Toggle Bileşeni ────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
            checked ? 'bg-indigo-500' : 'bg-zinc-700'
        }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

// ─── Bölüm Başlığı ──────────────────────────────────────────────────────────

const SectionTitle = ({ icon, label }: { icon: string; label: string }) => (
    <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">
        <i className={`fa-solid ${icon} text-indigo-400`} />
        {label}
    </label>
);

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export const AlgorithmConfig = ({
    options,
    onChange,
}: {
    options: GeneratorOptions;
    onChange: (k: string, v: unknown) => void;
}) => {
    const stepCount: number     = (options.stepCount as number)     ?? 6;
    const showHints: boolean    = (options.showHints as boolean)    ?? true;
    const showTime: boolean     = (options.showTime as boolean)     ?? false;
    const showSubSteps: boolean = (options.showSubSteps as boolean) ?? false;
    const colorTheme: string    = (options.colorTheme as string)    ?? 'varsayılan';
    const ageGroup: string      = (options.ageGroup as string)      ?? '8-10';
    const category: string      = (options.category as string)      ?? 'günlük_yaşam';
    const algorithmType: string = (options.algorithmType as string) ?? 'lineer';

    return (
        <div className="space-y-4 animate-in fade-in duration-300">

            {/* ── Sistem Senaryosu ── */}
            <div className="p-5 bg-zinc-900 text-white rounded-[2rem] border border-white/10 shadow-xl">
                <SectionTitle icon="fa-pen-nib" label="Sistem Senaryosu" />
                <input
                    type="text"
                    value={options.topic || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('topic', e.target.value)}
                    placeholder="Örn: Kek Yapımı, Robot Kontrol..."
                    className="w-full p-3.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors shadow-inner placeholder:text-zinc-600"
                />
            </div>

            {/* ── Konu Kategorisi ── */}
            <div className="p-5 bg-zinc-800/60 rounded-[2rem] border border-zinc-700 space-y-1">
                <SectionTitle icon="fa-layer-group" label="Konu Kategorisi" />
                <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => {
                        const isActive = category === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onChange('category', cat.id)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 scale-[1.04]'
                                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-700'
                                }`}
                            >
                                <i className={`fa-solid ${cat.icon} text-base`} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Algoritma Tipi ── */}
            <div className="p-5 bg-zinc-800/60 rounded-[2rem] border border-zinc-700">
                <SectionTitle icon="fa-diagram-project" label="Algoritma Tipi" />
                <div className="grid grid-cols-2 gap-2">
                    {ALGORITHM_TYPES.map(at => {
                        const isActive = algorithmType === at.id;
                        return (
                            <button
                                key={at.id}
                                onClick={() => onChange('algorithmType', at.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 border ${
                                    isActive
                                        ? 'border-indigo-500 bg-indigo-950 shadow-lg'
                                        : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
                                }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${at.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                                >
                                    <i className={`fa-solid ${at.icon} text-white text-xs`} />
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-indigo-300' : 'text-zinc-300'}`}>
                                        {at.label}
                                    </p>
                                    <p className="text-[8px] text-zinc-500 font-medium">{at.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Adım Sayısı Slider ── */}
            <div className="p-5 bg-zinc-800/60 rounded-[2rem] border border-zinc-700">
                <SectionTitle icon="fa-list-ol" label={`Adım Sayısı — ${stepCount}`} />
                <input
                    type="range"
                    min={4}
                    max={12}
                    step={1}
                    value={stepCount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange('stepCount', parseInt(e.target.value, 10))
                    }
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-500 bg-zinc-700"
                />
                <div className="flex justify-between text-[8px] text-zinc-600 font-black mt-1 px-0.5">
                    <span>4 (Kolay)</span>
                    <span>8 (Orta)</span>
                    <span>12 (Derin)</span>
                </div>
            </div>

            {/* ── Mantıksal Derinlik ── */}
            <div className="p-5 bg-zinc-800/60 rounded-[2rem] border border-zinc-700">
                <SectionTitle icon="fa-brain" label="Mantıksal Derinlik" />
                <div className="flex bg-zinc-900 p-1 rounded-xl gap-1">
                    {(['Başlangıç', 'Orta', 'Zor'] as const).map((d, idx) => {
                        const labels = ['Lineer', 'Karar Destekli', 'Karmaşık'];
                        const isActive = options.difficulty === d;
                        return (
                            <button
                                key={d}
                                onClick={() => onChange('difficulty', d)}
                                className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                {labels[idx]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Yaş Grubu ── */}
            <div className="p-5 bg-zinc-800/60 rounded-[2rem] border border-zinc-700">
                <SectionTitle icon="fa-user-graduate" label="Yaş Grubu" />
                <div className="flex gap-2">
                    {AGE_GROUPS.map(ag => (
                        <button
                            key={ag}
                            onClick={() => onChange('ageGroup', ag)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all duration-200 ${
                                ageGroup === ag
                                    ? 'bg-violet-600 text-white shadow-lg'
                                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-700'
                            }`}
                        >
                            {ag}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Renk Teması ── */}
            <div className="p-5 bg-zinc-800/60 rounded-[2rem] border border-zinc-700">
                <SectionTitle icon="fa-palette" label="Renk Teması" />
                <div className="flex gap-2">
                    {COLOR_THEMES.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => onChange('colorTheme', theme.id)}
                            title={theme.label}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl text-[9px] font-black uppercase transition-all duration-200 ${
                                colorTheme === theme.id
                                    ? 'bg-zinc-700 text-white ring-2 ring-white/30'
                                    : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-700'
                            }`}
                        >
                            <span
                                className="w-5 h-5 rounded-full border-2 border-white/20 shadow-md"
                                style={{ backgroundColor: theme.dot }}
                            />
                            {theme.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Gelişmiş Seçenekler ── */}
            <div className="p-5 bg-zinc-800/60 rounded-[2rem] border border-zinc-700 space-y-3">
                <SectionTitle icon="fa-sliders" label="Gelişmiş Seçenekler" />

                {/* İpucu Balonları */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black text-zinc-300">💡 İpucu Balonları</p>
                        <p className="text-[8px] text-zinc-500">Disleksi dostu adım ipuçları</p>
                    </div>
                    <Toggle checked={showHints} onChange={v => onChange('showHints', v)} />
                </div>

                {/* Zaman Tahmini */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black text-zinc-300">⏱️ Zaman Tahmini</p>
                        <p className="text-[8px] text-zinc-500">Her adımda dakika rozeti (DEHB desteği)</p>
                    </div>
                    <Toggle checked={showTime} onChange={v => onChange('showTime', v)} />
                </div>

                {/* Alt Adımlar */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black text-zinc-300">📋 Alt Adımlar</p>
                        <p className="text-[8px] text-zinc-500">Süreç adımlarında detaylı liste</p>
                    </div>
                    <Toggle checked={showSubSteps} onChange={v => onChange('showSubSteps', v)} />
                </div>
            </div>

        </div>
    );
};
