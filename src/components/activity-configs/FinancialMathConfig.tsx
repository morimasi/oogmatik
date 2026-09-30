
import React from 'react';
import { GeneratorOptions } from '../../types';

export const FinancialMathConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-emerald-900/10 rounded-[2rem] border border-[var(--border-color)] dark:border-emerald-800/30">
                <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-3 block text-center">Para Havuzu</label>
                <div className="grid grid-cols-2 gap-2">
                    {['Sadece Madeni', 'Sadece Kağıt', 'Karışık'].map(t => (
                        <button 
                            key={t}
                            onClick={() => onChange('variant', t)}
                            className={`py-2 rounded-xl text-[10px] font-black border transition-all ${options.variant === t ? 'bg-emerald-600 text-[var(--text-primary)] border-emerald-600 shadow-md' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30">
                <label className="text-[10px] font-black text-amber-600 uppercase mb-3 block text-center">Cüzdan Sayısı (Sayfa İçi)</label>
                <div className="flex gap-2">
                    {[6, 8, 10].map(count => (
                        <button 
                            key={count}
                            onClick={() => onChange('itemCount', count)}
                            className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${(options.itemCount || 8) === count ? 'bg-amber-500 text-[var(--text-primary)] border-amber-500 shadow-sm' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'}`}
                        >
                            {count}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)]">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">İşlem Limiti (TL)</label>
                    <select 
                        value={typeof options.numberRange === 'string' ? options.numberRange : '1-100'} 
                        onChange={e => onChange('numberRange', e.target.value)}
                        className="w-full p-2.5 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold"
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
