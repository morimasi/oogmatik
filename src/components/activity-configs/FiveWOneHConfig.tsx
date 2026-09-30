import React from 'react';
import { GeneratorOptions } from '../../types';

interface ToggleOption {
    value: string | number;
    label: string;
}

interface CompactToggleGroupProps {
    label: string;
    selected: string | number;
    onChange: (value: unknown) => void;
    options: ToggleOption[];
}

const CompactToggleGroup: React.FC<CompactToggleGroupProps> = ({ label, selected, onChange, options }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-zinc-100 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)] border-[var(--border-color)]">
            {options.map((opt, idx) => (
                <button key={idx} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-zinc-700 dark:hover:text-[var(--text-secondary)]'}`}>
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const FiveWOneHConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] dark:border-indigo-800/30 space-y-4">
                <div>
                    <label className="text-[10px] font-black text-[var(--accent-color)] dark:text-[var(--accent-color)] uppercase tracking-widest mb-2 block">Özel İlgi Alanı / Tema</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('topic', e.target.value)}
                        placeholder="Örn: Uzay, Dinozorlar, Futbol..."
                        className="w-full p-4 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] border-[var(--border-color)] rounded-2xl text-sm font-bold outline-none focus:border-[var(--accent-color)] text-[var(--text-primary)] placeholder-zinc-400 shadow-inner"
                    />
                </div>

                <CompactToggleGroup
                    label="Sınıf Seviyesi"
                    selected={((options as Record<string, unknown>).classLevel as string | number) || 1}
                    onChange={(v: unknown) => onChange('classLevel', v)}
                    options={[
                        { value: 1, label: '1. Sınıf' },
                        { value: 2, label: '2. Sınıf' },
                        { value: 3, label: '3. Sınıf' },
                        { value: 4, label: '4. Sınıf' },
                        { value: 5, label: '5. Sınıf' },
                        { value: 6, label: '6. Sınıf' },
                        { value: 7, label: '7. Sınıf' },
                        { value: 8, label: '8. Sınıf' }
                    ]}
                />

                <CompactToggleGroup
                    label="Metin Uzunluğu"
                    selected={options.textLength || 'kısa'}
                    onChange={(v: unknown) => onChange('textLength', v as string)}
                    options={[
                        { value: 'kısa', label: 'Kısa (~4 Satır)' },
                        { value: 'orta', label: 'Orta (1 Paragraf)' },
                        { value: 'uzun', label: 'Uzun (Çoklu)' }
                    ]}
                />
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] border-[var(--border-color)] space-y-5 shadow-inner">

                <CompactToggleGroup
                    label="Zorluk Seviyesi"
                    selected={options.difficulty || '7-8'}
                    onChange={(v: unknown) => onChange('difficulty', v as string)}
                    options={[
                        { value: '1-2', label: '1-2. Sınıf' },
                        { value: '3-4', label: '3-4. Sınıf' },
                        { value: '5-6', label: '5-6. Sınıf' },
                        { value: '7-8', label: '7-8. Sınıf' }
                    ]}
                />

                <CompactToggleGroup
                    label="Üretim Modu"
                    selected={options.generationMode || 'ai'}
                    onChange={(v: unknown) => onChange('generationMode', v as string)}
                    options={[
                        { value: 'fast', label: 'Hızlı' },
                        { value: 'ai', label: 'AI Modu' }
                    ]}
                />

                <CompactToggleGroup
                    label="Soru Formati"
                    selected={options.questionStyle || 'test_and_open'}
                    onChange={(v: unknown) => onChange('questionStyle', v as string)}
                    options={[
                        { value: 'test_and_open', label: 'Karma Mod' },
                        { value: 'only_test', label: 'Sadece Şıklı' },
                        { value: 'only_open_ended', label: 'Açık Uçlu' }
                    ]}
                />

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">Ultra Premium Deneyim</label>
                    <div className="flex bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] border-[var(--border-color)] rounded-xl overflow-hidden cursor-pointer" onClick={() => onChange('premiumMode', !options.premiumMode)}>
                        <div className={`flex-1 p-3 text-center text-xs font-black transition-all ${options.premiumMode ? 'bg-amber-500 text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:bg-zinc-100 dark:hover:bg-[var(--bg-paper)]'}`}>
                            {options.premiumMode ? 'Açık' : 'Kapalı'}
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">Renkli Hece Boyama</label>
                    <div className="flex bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] border-[var(--border-color)] rounded-xl overflow-hidden cursor-pointer" onClick={() => onChange('syllableColoring', !options.syllableColoring)}>
                        <div className={`flex-1 p-3 text-center text-xs font-black transition-all ${options.syllableColoring ? 'bg-[var(--accent-color)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:bg-zinc-100'}`}>
                            Aktif (Di-kkat)
                        </div>
                        <div className={`flex-1 p-3 text-center text-xs font-black transition-all ${!options.syllableColoring ? 'bg-[var(--bg-secondary)]0 text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:bg-zinc-100'}`}>
                            Pasif (Normal)
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">Font Konfigürasyonu</label>
                    <select
                        value={options.fontFamily || 'Comic Sans MS'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('fontFamily', e.target.value)}
                        className="w-full p-3 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:border-[var(--accent-color)] text-[var(--text-primary)]"
                    >
                        <option value="Comic Sans MS">Comic Sans (Disleksi Dostu)</option>
                        <option value="Arial">Arial (Klasik)</option>
                        <option value="OpenDyslexic">OpenDyslexic</option>
                        <option value="Verdana">Verdana</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
