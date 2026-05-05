import React from 'react';
import { GeneratorOptions } from '../../types';

interface ToggleOption {
    value: string | number;
    label: string;
}

interface CompactToggleGroupProps {
    label: string;
    selected: string | number;
    onChange: (value: any) => void;
    options: ToggleOption[];
}

const CompactToggleGroup: React.FC<CompactToggleGroupProps> = ({ label, selected, onChange, options }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt) => (
                <button 
                    key={opt.value} 
                    onClick={() => onChange(opt.value)} 
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${String(selected) === String(opt.value) ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
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

export const ShortAnswerConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    const params = options.params || {};

    const updateParam = (key: string, value: any) => {
        onChange('params', { ...params, [key]: value });
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 space-y-4">
                <div>
                    <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 block">Etkinlik Başlığı</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('topic', e.target.value)}
                        placeholder="Örn: Ev Eşyaları, Hayvanlar..."
                        className="w-full p-3 bg-white dark:bg-zinc-800 border-2 border-indigo-100 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 dark:text-zinc-100 placeholder-zinc-400 shadow-inner"
                    />
                </div>

                <CompactToggleGroup
                    label="Soru Sayısı"
                    selected={params.questionCount || '15'}
                    onChange={(v: string) => updateParam('questionCount', v)}
                    options={[
                        { value: '6', label: '6 Soru' },
                        { value: '9', label: '9 Soru' },
                        { value: '12', label: '12 Soru' },
                        { value: '15', label: '15 Soru' }
                    ]}
                />

                <CompactToggleGroup
                    label="Satır Sayısı"
                    selected={params.lineCount || 2}
                    onChange={(v: number) => updateParam('lineCount', v)}
                    options={[
                        { value: 1, label: '1 Satır' },
                        { value: 2, label: '2 Satır' },
                        { value: 3, label: '3 Satır' }
                    ]}
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                <CompactToggleGroup
                    label="Renk Düzeni"
                    selected={params.colorMode || 'Karma Renkli'}
                    onChange={(v: string) => updateParam('colorMode', v)}
                    options={[
                        { value: 'Karma Renkli', label: 'Karma' },
                        { value: 'Tek Renk (Premium)', label: 'Tek Renk' }
                    ]}
                />

                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium leading-relaxed">
                        <i className="fa-solid fa-circle-info mr-1"></i>
                        A4 Kompakt modda 15 soru tek sayfaya sığar. Satır sayısı arttıkça kutu yüksekliği otomatik ayarlanır.
                    </p>
                </div>
            </div>
        </div>
    );
};
