
import React from 'react';
import { GeneratorOptions } from '../../types';

interface MathPuzzleConfigProps {
    options: GeneratorOptions;
    onChange: (key: string, value: unknown) => void;
    aiMode?: boolean;
    onAiModeToggle?: (enabled: boolean) => void;
}

const MiniSelect = ({ label, value, onChange, options: opts }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-0.5">
        <label className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[11px] font-bold outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all dark:text-zinc-200">
            {opts.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const MiniToggle = ({ label, value, onChange, icon }: { label: string; value: boolean; onChange: (v: boolean) => void; icon: string }) => (
    <button
        onClick={() => onChange(!value)}
        className={`flex items-center justify-between w-full p-2 rounded-xl border transition-all text-left ${value ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
    >
        <span className="text-[10px] font-bold flex items-center gap-1.5">
            <span className="text-xs">{icon}</span>
            {label}
        </span>
        <div className={`w-7 h-3.5 rounded-full relative transition-colors ${value ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
            <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-all ${value ? 'left-4' : 'left-0.5'}`} />
        </div>
    </button>
);

const DensitySelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">Sayfa Doluluğu</label>
        <div className="flex gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            {[4, 6, 8, 10, 12].map(n => (
                <button
                    key={n}
                    onClick={() => onChange(n)}
                    className={`flex-1 py-1.5 rounded-md font-bold text-[10px] transition-all ${value === n ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                >
                    {n}
                </button>
            ))}
        </div>
    </div>
);

export const MathPuzzleConfig: React.FC<MathPuzzleConfigProps> = ({ options, onChange, aiMode = false, onAiModeToggle }) => {
    const opts = options as Record<string, unknown>;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* AI Mod Toggle */}
            {onAiModeToggle && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                    <button
                        onClick={() => onAiModeToggle(!aiMode)}
                        className={`flex items-center justify-between w-full ${aiMode ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-500'}`}
                    >
                        <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2">
                            <span className="text-base">✨</span>
                            AI Üretim Modu
                        </span>
                        <div className={`w-9 h-5 rounded-full relative transition-colors ${aiMode ? 'bg-violet-500' : 'bg-zinc-300'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all ${aiMode ? 'left-5' : 'left-1'}`} />
                        </div>
                    </button>
                    {aiMode && (
                        <p className="text-[9px] text-zinc-400 mt-2 leading-tight">
                            AI, seçtiğin ayarlara göre otomatik bulmaca üretir. Hızlı modda anında önizleme.
                        </p>
                    )}
                </div>
            )}

            {/* Ana Ayarlar - Kompakt Grid */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                <MiniSelect
                    label="Bulmaca Türü"
                    value={(opts.puzzleType as string) || 'visual'}
                    onChange={(v) => onChange('puzzleType', v)}
                    options={[
                        { value: 'visual', label: '🍎 Görsel Denklem' },
                        { value: 'logic', label: '🧠 Mantık Bilmecesi' },
                        { value: 'magic_square', label: '🔮 Sihirli Kare' },
                        { value: 'mixed', label: '🌈 Karma' }
                    ]}
                />
                <MiniSelect
                    label="İşlem Kurgusu"
                    value={(opts.operationType as string) || 'mixed'}
                    onChange={(v) => onChange('operationType', v)}
                    options={[
                        { value: 'add', label: '➕ Toplama' },
                        { value: 'mixed', label: '➕➖ Top/Çık' },
                        { value: 'mult', label: '✖️➗ Çarp/Böl' },
                        { value: 'expert', label: '🎯 Dört İşlem' }
                    ]}
                />
                <MiniSelect
                    label="Sayı Aralığı"
                    value={(opts.numberRange as string) || '1-20'}
                    onChange={(v) => onChange('numberRange', v)}
                    options={[
                        { value: '1-10', label: '1 – 10' },
                        { value: '1-20', label: '1 – 20' },
                        { value: '1-50', label: '1 – 50' },
                        { value: '1-100', label: '1 – 100' }
                    ]}
                />
                <MiniSelect
                    label="Zorluk"
                    value={(opts.difficulty as string) || 'Orta'}
                    onChange={(v) => onChange('difficulty', v)}
                    options={[
                        { value: 'Kolay', label: '🟢 Kolay' },
                        { value: 'Orta', label: '🟡 Orta' },
                        { value: 'Zor', label: '🔴 Zor' },
                        { value: 'Uzman', label: '⚫ Uzman' }
                    ]}
                />
            </div>

            {/* Sayfa Doluluk */}
            <DensitySelector
                value={(opts.itemCount as number) || 6}
                onChange={(v) => onChange('itemCount', v)}
            />

            {/* Premium Modifikatörler */}
            <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Modifikatörler</label>
                <div className="grid grid-cols-2 gap-1.5">
                    <MiniToggle
                        label="Hikaye Modu"
                        value={(opts.storyMode as boolean) ?? true}
                        onChange={(v) => onChange('storyMode', v)}
                        icon="📖"
                    />
                    <MiniToggle
                        label="Renkli Metin"
                        value={(opts.colorfulText as boolean) ?? false}
                        onChange={(v) => onChange('colorfulText', v)}
                        icon="🎨"
                    />
                    <MiniToggle
                        label="Kompakt A4"
                        value={(opts.compactLayout as boolean) ?? true}
                        onChange={(v) => onChange('compactLayout', v)}
                        icon="📐"
                    />
                    <MiniToggle
                        label="Hızlı Mod"
                        value={(opts.fastMode as boolean) ?? false}
                        onChange={(v) => onChange('fastMode', v)}
                        icon="⚡"
                    />
                </div>
            </div>

            {/* Bilgi */}
            <div className="p-2.5 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-center">
                <p className="text-[9px] text-zinc-400 italic">
                    {(opts.itemCount as number) || 6} bulmaca · {(opts.puzzleType as string) === 'mixed' ? 'Karma' : (opts.puzzleType as string) || 'Görsel'} · {(opts.operationType as string) || 'mixed'}
                </p>
            </div>
        </div>
    );
};
