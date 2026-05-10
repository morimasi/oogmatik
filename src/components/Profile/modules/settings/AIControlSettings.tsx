import React, { ChangeEvent } from 'react';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { StatCard } from '../../components/shared/StatCard';
import { ToggleSwitch } from '../../components/shared/ToggleSwitch';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import type { AIControlSettingsProps, AISettingsData } from '../../types';

const TONES = [
    { id: 'kurumsal', label: 'Kurumsal', icon: 'fa-building' },
    { id: 'öğretmen', label: 'Öğretmen', icon: 'fa-chalkboard-user' },
    { id: 'bilimsel', label: 'Bilimsel', icon: 'fa-flask-vial' },
    { id: 'dostane', label: 'Dostane', icon: 'fa-face-smile' },
];

const SCAFFOLDING_LEVELS = [
    { id: 'low', label: 'Düşük' },
    { id: 'balanced', label: 'Dengeli' },
    { id: 'high', label: 'Yüksek' },
    { id: 'max', label: 'Maksimum' },
] as const;

const IMAGE_MODES = [
    { value: 'cartoon', label: 'Pedagojik İllüstrasyon (Yumuşak)' },
    { value: 'realistic', label: 'Gerçekçi Fotoğraf (Vivid)' },
    { value: 'schematic', label: 'Şematik & Teknik Çizim' },
    { value: 'lineart', label: 'Boyama Sayfası (Line Art)' },
];

const TOGGLE_FEATURES = [
    { id: 'autoSuggest', label: 'Akıllı Öneriler', icon: 'fa-lightbulb' },
    { id: 'voiceAssistant', label: 'Sesli Asistan', icon: 'fa-microphone' },
];

export const AIControlSettings: React.FC<AIControlSettingsProps> = () => {
    const { aiSettings, setAiSettings, debouncedSave } = useProfileSettings();

    const update = (field: keyof AISettingsData, value: unknown) => {
        setAiSettings((prev: AISettingsData) => ({ ...prev, [field]: value }));
        debouncedSave();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* AI Motor Bilgisi Hero */}
            <div className="p-6 bg-gradient-to-br from-indigo-600/10 to-transparent rounded-[2.5rem] border border-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 flex items-center justify-center md:justify-start gap-2">
                            <i className="fa-solid fa-wand-magic-sparkles" /> Omnikron AI Pro
                        </h3>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Hiper-Parametrik Üretim Motoru</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 border border-indigo-400/50">
                            Gemini 2.5 Flash
                        </div>
                        <div className="px-4 py-1.5 bg-white dark:bg-zinc-800 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900 shadow-sm">
                            v3.0 Master
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                    <StatCard value="0.72s" label="Avg Latency" icon="fa-bolt" color="text-indigo-600" />
                    <StatCard value="99.8%" label="Success Rate" icon="fa-chart-line" color="text-emerald-500" />
                    <StatCard value="1.2M" label="Context Win" icon="fa-database" color="text-indigo-600" />
                    <StatCard value="Legend" label="Reputation" icon="fa-star" color="text-purple-600" />
                </div>
            </div>

            {/* AI Kontroller */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ton Seçimi */}
                <div>
                    <SectionHeader title="AI Konuşma Tonu" icon="fa-comment-dots" />
                    <div className="grid grid-cols-2 gap-2">
                        {TONES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => update('tone', t.id)}
                                className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${aiSettings.tone === t.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                <i className={`fa-solid ${t.icon} text-[10px]`} /> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Görsel Üretim Modu */}
                <div>
                    <SectionHeader title="Görsel Üretim Modu" icon="fa-image" />
                    <select
                        value={aiSettings.imageMode}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => update('imageMode', e.target.value)}
                        className="w-full p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-bold text-sm text-[var(--text-primary)] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    >
                        {IMAGE_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Scaffolding + Yaratıcılık */}
            <div className="p-5 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-color)] space-y-6">
                {/* Scaffolding */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <SectionHeader title="Pedagojik İskele Seviyesi" icon="fa-layer-group" />
                        <span className="text-xs font-black text-indigo-600">
                            {SCAFFOLDING_LEVELS.find(l => l.id === aiSettings.scaffolding)?.label || 'Dengeli'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {SCAFFOLDING_LEVELS.map(l => (
                            <button
                                key={l.id}
                                onClick={() => update('scaffolding', l.id)}
                                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${aiSettings.scaffolding === l.id
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600'
                                    }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Yaratıcılık Slider */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <SectionHeader title="Yaratıcılık Matrisi" icon="fa-sparkles" />
                        <span className="text-xs font-black text-indigo-600">%{aiSettings.creativity}</span>
                    </div>
                    <input
                        type="range" min="0" max="100"
                        value={aiSettings.creativity}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update('creativity', Number(e.target.value))}
                        className="w-full h-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between mt-1 px-1">
                        <span className="text-[8px] font-black text-zinc-400 uppercase">Muhafazakar</span>
                        <span className="text-[8px] font-black text-zinc-400 uppercase">Dengeli</span>
                        <span className="text-[8px] font-black text-zinc-400 uppercase">Kaotik Yaratıcı</span>
                    </div>
                </div>
            </div>

            {/* Toggle Özellikleri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TOGGLE_FEATURES.map(item => (
                    <div
                        key={item.id}
                        onClick={() => update(item.id as keyof AISettingsData, !(aiSettings as Record<string, unknown>)[item.id])}
                        className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] flex items-center justify-between hover:border-indigo-500/30 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 transition-colors">
                                <i className={`fa-solid ${item.icon} text-xs`} />
                            </div>
                            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight">{item.label}</span>
                        </div>
                        <ToggleSwitch
                            enabled={!!(aiSettings as Record<string, unknown>)[item.id]}
                            onChange={() => update(item.id as keyof AISettingsData, !(aiSettings as Record<string, unknown>)[item.id])}
                            size="sm"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
