import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: any) => void;
}

export const FiveWOneHConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 space-y-4">
                <div>
                    <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 block">Özel İlgi Alanı / Tema</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={e => onChange('topic', e.target.value)}
                        placeholder="Örn: Uzay, Dinozorlar, Futbol..."
                        className="w-full p-4 bg-white dark:bg-zinc-800 border-2 border-indigo-100 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 dark:text-zinc-100 placeholder-zinc-400 shadow-inner"
                    />
                </div>

                <CompactToggleGroup
                    label="Sınıf Seviyesi"
                    selected={options.classLevel || 1}
                    onChange={(v: any) => onChange('classLevel', v)}
                    options={[
                        { value: 1, label: '1. Sınıf' },
                        { value: 2, label: '2. Sınıf' },
                        { value: 3, label: '3. Sınıf' },
                        { value: 4, label: '4. Sınıf' }
                    ]}
                />

                <CompactToggleGroup
                    label="Metin Uzunluğu"
                    selected={options.textLength || 'kısa'}
                    onChange={(v: string) => onChange('textLength', v)}
                    options={[
                        { value: 'kısa', label: 'Kısa (~4 Satır)' },
                        { value: 'orta', label: 'Orta (1 Paragraf)' },
                        { value: 'uzun', label: 'Uzun (Çoklu)' }
                    ]}
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">

                <CompactToggleGroup
                    label="Zorluk Seviyesi"
                    selected={options.difficulty || 'orta'}
                    onChange={(v: string) => onChange('difficulty', v)}
                    options={[
                        { value: 'çok kolay', label: 'Süper Kolay' },
                        { value: 'kolay', label: 'Kolay' },
                        { value: 'orta', label: 'Orta' },
                        { value: 'zor', label: 'Zor' }
                    ]}
                />

                <CompactToggleGroup
                    label="Soru Formati"
                    selected={options.questionStyle || 'test_and_open'}
                    onChange={(v: string) => onChange('questionStyle', v)}
                    options={[
                        { value: 'test_and_open', label: 'Karma Mod' },
                        { value: 'only_test', label: 'Sadece Şıklı' },
                        { value: 'only_open_ended', label: 'Açık Uçlu' }
                    ]}
                />

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">Renkli Hece Boyama</label>
                    <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden cursor-pointer" onClick={() => onChange('syllableColoring', !options.syllableColoring)}>
                        <div className={`flex-1 p-3 text-center text-xs font-black transition-all ${options.syllableColoring ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:bg-zinc-100'}`}>
                            Aktif (Di-kkat)
                        </div>
                        <div className={`flex-1 p-3 text-center text-xs font-black transition-all ${!options.syllableColoring ? 'bg-zinc-500 text-white' : 'text-zinc-400 hover:bg-zinc-100'}`}>
                            Pasif (Normal)
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">Font Konfigürasyonu</label>
                    <select
                        value={options.fontFamily || 'Comic Sans MS'}
                        onChange={e => onChange('fontFamily', e.target.value)}
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 dark:text-zinc-200"
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
