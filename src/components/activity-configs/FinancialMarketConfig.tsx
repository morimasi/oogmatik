import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: { label: string; selected: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-1 mt-4">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: { value: string; label: string }) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
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

export const FinancialMarketConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-lime-50/50 dark:bg-lime-900/10 rounded-[2rem] border border-lime-100 dark:border-lime-800/30">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black text-lime-800 uppercase tracking-widest"><i className="fa-solid fa-coins mr-1"></i> Ekonomi & Market Ayarları</h4>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Market Konsepti</label>
                        <select
                            value={(options as any).marketTheme || 'grocery'}
                            onChange={e => onChange('marketTheme' as any, e.target.value)}
                            className="w-full p-2 bg-white border border-lime-200 rounded-xl text-sm font-bold outline-none focus:border-lime-500"
                        >
                            <option value="grocery">Bereket Süpermarket</option>
                            <option value="stationery">Bilge Kırtasiye</option>
                            <option value="bakery">Tatlı Fırın & Pastane</option>
                            <option value="toy_store">Hayal Oyuncakçı</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">A4 Görev Sayısı</label>
                        <select
                            value={(options as any).taskCount || 4}
                            onChange={e => onChange('taskCount' as any, parseInt(e.target.value))}
                            className="w-full p-2 bg-white border border-lime-200 rounded-xl text-sm font-bold outline-none focus:border-lime-500"
                        >
                            <option value={2}>2 Alışveriş Fişi (Büyük)</option>
                            <option value={4}>4 Fiş (A4 Dengeli Dolgu)</option>
                            <option value={6}>6 Fiş (Kompakt Zengin Dolgu)</option>
                        </select>
                    </div>
                </div>

                <CompactToggleGroup
                    label="Para Birimi (Sembol)"
                    selected={options.currency || 'TRY'}
                    onChange={(v: string) => onChange('currency', v)}
                    options={[
                        { value: 'TRY', label: '₺ Türk Lirası' },
                        { value: 'USD', label: '$ Dolar' },
                        { value: 'EUR', label: '€ Euro' }
                    ]}
                />

                <div className="mt-4 flex items-center justify-between p-3 bg-white border border-lime-200 rounded-xl">
                    <div>
                        <label className="text-xs font-bold text-zinc-700 block">Kuruş / Cent Kullanımı</label>
                        <p className="text-[9px] text-zinc-500">Ondalıklı alışveriş fiyatları (Örn: 15.50 ₺)</p>
                    </div>
                    <button
                        onClick={() => onChange('useCents', !options.useCents)}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${options.useCents ? 'bg-lime-500' : 'bg-zinc-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${options.useCents ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 shadow-inner space-y-4">
                <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        <span>Maksimum Bütçe Sınırı</span>
                        <span className="text-lime-600 font-black">{options.budgetLimit || 100} {options.currency === 'USD' ? '$' : options.currency === 'EUR' ? '€' : '₺'}</span>
                    </div>
                    <input
                        type="range" min={50} max={1000} step={50}
                        value={options.budgetLimit || 100}
                        onChange={e => onChange('budgetLimit', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-lime-600 mt-2"
                    />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/40">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase">İndirim & Kampanya Kuponları</label>
                        <span className="text-[9px] text-zinc-400">Sepet tutarına özel indirim çıkarma becerisi</span>
                    </div>
                    <button
                        onClick={() => onChange('enableDiscounts' as any, !(options as any).enableDiscounts)}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${(options as any).enableDiscounts ? 'bg-lime-500' : 'bg-zinc-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${(options as any).enableDiscounts ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};
