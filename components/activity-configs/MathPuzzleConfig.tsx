
import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactSelect = ({ label, value, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase block">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 dark:text-zinc-200">
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

export const MathPuzzleConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/30 space-y-4">
                <CompactSelect 
                    label="İşlem Kurgusu" 
                    value={options.operationType || 'add'} 
                    onChange={(v: string) => onChange('operationType', v)}
                    options={[
                        { value: 'add', label: 'Sadece Toplama' },
                        { value: 'mixed', label: 'Toplama & Çıkarma' },
                        { value: 'mult', label: 'Çarpma Dahil (Zor)' }
                    ]}
                />
                <CompactSelect 
                    label="Sayı Aralığı" 
                    value={options.numberRange || '1-20'} 
                    onChange={(v: string) => onChange('numberRange', v)}
                    options={[
                        { value: '1-10', label: '1 - 10 (Başlangıç)' },
                        { value: '1-20', label: '1 - 20 (Standart)' },
                        { value: '1-50', label: '1 - 50 (İleri Seviye)' }
                    ]}
                />
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-[2rem] border border-zinc-100 dark:border-zinc-700">
                <label className="text-[10px] font-black text-zinc-400 uppercase mb-3 block text-center">Bulmaca Sayısı (Sayfa Başı)</label>
                <div className="flex gap-4">
                    {[1, 2, 4].map(n => (
                        <button 
                            key={n} 
                            onClick={() => onChange('itemCount', n)}
                            className={`flex-1 py-3 rounded-2xl font-black text-sm border-2 transition-all ${options.itemCount === n ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-xl scale-105' : 'bg-white dark:bg-zinc-700 border-zinc-100 dark:border-zinc-600 text-zinc-400'}`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
