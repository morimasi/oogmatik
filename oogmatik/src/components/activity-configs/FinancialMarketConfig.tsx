import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1 mt-4">
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

export const FinancialMarketConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-lime-50/50 dark:bg-lime-900/10 rounded-[2rem] border border-lime-100 dark:border-lime-800/30">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black text-lime-800 uppercase tracking-widest"><i className="fa-solid fa-coins mr-1"></i> Ekonomi Ayarları</h4>
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
                        <p className="text-[9px] text-zinc-500">Ondalıklı işlemler (Örn: 15.50 ₺)</p>
                    </div>
                    <button
                        onClick={() => onChange('useCents', !options.useCents)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${options.useCents ? 'bg-lime-500' : 'bg-zinc-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${options.useCents ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 shadow-inner">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                            <span>Maksimum Bütçe Sınırı</span>
                            <span className="text-lime-600 font-black">{options.budgetLimit || 100} Birim</span>
                        </div>
                        <input
                            type="range" min={10} max={1000} step={10}
                            value={options.budgetLimit || 100}
                            onChange={e => onChange('budgetLimit', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-lime-600 mt-2"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                            <span>Tek Görevdeki Sepet Miktarı (Parça)</span>
                            <span className="text-lime-600 font-black">{options.cartSize || 2} Ürün</span>
                        </div>
                        <input
                            type="range" min={1} max={5} step={1}
                            value={options.cartSize || 2}
                            onChange={e => onChange('cartSize', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-lime-600 mt-2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
