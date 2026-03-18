
import React from 'react';
import { GeneratorOptions } from '../../types';

export const FinancialMathConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30">
                <label className="text-[10px] font-black text-emerald-600 uppercase mb-3 block text-center">Para Havuzu</label>
                <div className="grid grid-cols-2 gap-2">
                    {['Sadece Madeni', 'Sadece Kağıt', 'Karışık'].map(t => (
                        <button 
                            key={t}
                            onClick={() => onChange('variant', t)}
                            className={`py-2 rounded-xl text-[10px] font-black border transition-all ${options.variant === t ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block">İşlem Limiti (TL)</label>
                    <select 
                        value={options.numberRange || '1-50'} 
                        onChange={e => onChange('numberRange', e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                    >
                        <option value="1-20">20 TL'ye kadar (Basit)</option>
                        <option value="1-100">100 TL'ye kadar (Orta)</option>
                        <option value="1-500">500 TL'ye kadar (İleri)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
