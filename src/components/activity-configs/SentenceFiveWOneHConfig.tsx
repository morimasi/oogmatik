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
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
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

/**
 * Cümlede 5N1K - Ultra Profesyonel Ayar Paneli
 */
export const SentenceFiveWOneHConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 space-y-4">
                <div>
                    <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 block">Özel Tema / Konu Odaklı</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('topic', e.target.value)}
                        placeholder="Örn: Orman macerası, Robotlar, Bilim..."
                        className="w-full p-4 bg-white dark:bg-zinc-800 border-2 border-indigo-100 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 dark:text-zinc-100 placeholder-zinc-400 shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Cümle Sayısı</label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={options.itemCount || 5}
                            onChange={(e) => onChange('itemCount', parseInt(e.target.value))}
                            className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Yaş Grubu</label>
                        <select
                            value={options.ageGroup || '8-10'}
                            onChange={(e) => onChange('ageGroup', e.target.value)}
                            className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                        >
                            <option value="5-7">5-7 Yaş</option>
                            <option value="8-10">8-10 Yaş</option>
                            <option value="11-13">11-13 Yaş</option>
                            <option value="14+">14+ Yaş</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                <CompactToggleGroup
                    label="Zorluk Seviyesi"
                    selected={options.difficulty || 'Orta'}
                    onChange={(v: string) => onChange('difficulty', v)}
                    options={[
                        { value: 'Kolay', label: 'Basit' },
                        { value: 'Orta', label: 'Standart' },
                        { value: 'Zor', label: 'Karmaşık' }
                    ]}
                />

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">Pedagojik Profil Odaklı</label>
                    <select
                        value={options.profile || 'dyslexia'}
                        onChange={(e) => onChange('profile', e.target.value)}
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                    >
                        <option value="dyslexia">Disleksi (Kısa & Net)</option>
                        <option value="adhd">DEHB (Dinamik & İlgi Çekici)</option>
                        <option value="dyscalculia">Diskalkuli (Sayısal Olmayan)</option>
                    </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/20">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Tüm 5N1K Öğeleri</span>
                        <span className="text-[9px] text-zinc-500">Her cümlede 6 sorunun tamamını sorar.</span>
                    </div>
                    <div className="flex bg-white dark:bg-zinc-800 p-1 rounded-lg border border-indigo-200">
                         <span className="px-3 py-1 text-[9px] font-black text-indigo-600">AKTİF</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
