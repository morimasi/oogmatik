import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: { label: string; selected: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-1 mt-4">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
            {options.map((opt: { value: string; label: string }) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-secondary)]'}`}>
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
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Market Konsepti</label>
                        <select
                            value={(options as any).marketTheme || 'grocery'}
                            onChange={e => onChange('marketTheme' as any, e.target.value)}
                            className="w-full p-2 bg-[var(--bg-paper)] border border-lime-200 rounded-xl text-sm font-bold outline-none focus:border-lime-500"
                        >
                            <option value="grocery">Bereket Süpermarket</option>
                            <option value="stationery">Bilge Kırtasiye</option>
                            <option value="bakery">Tatlı Fırın & Pastane</option>
                            <option value="toy_store">Hayal Oyuncakçı</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">A4 Görev Sayısı</label>
                        <select
                            value={(options as any).taskCount || 4}
                            onChange={e => onChange('taskCount' as any, parseInt(e.target.value))}
                            className="w-full p-2 bg-[var(--bg-paper)] border border-lime-200 rounded-xl text-sm font-bold outline-none focus:border-lime-500"
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

                <div className="mt-4 flex items-center justify-between p-3 bg-[var(--bg-paper)] border border-lime-200 rounded-xl">
                    <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] block">Kuruş / Cent Kullanımı</label>
                        <p className="text-[9px] text-[var(--text-muted)]">Ondalıklı alışveriş fiyatları (Örn: 15.50 ₺)</p>
                    </div>
                    <button
                        onClick={() => onChange('useCents', !options.useCents)}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${options.useCents ? 'bg-lime-500' : 'bg-[var(--surface-elevated)]'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-[var(--bg-paper)] absolute top-1 transition-transform ${options.useCents ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] shadow-inner space-y-4">
                <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase">
                        <span>Maksimum Bütçe Sınırı</span>
                        <span className="text-lime-600 font-black">{options.budgetLimit || 100} {options.currency === 'USD' ? '$' : options.currency === 'EUR' ? '€' : '₺'}</span>
                    </div>
                    <input
                        type="range" min={50} max={1000} step={50}
                        value={options.budgetLimit || 100}
                        onChange={e => onChange('budgetLimit', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[var(--surface-elevated)] bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-lime-600 mt-2"
                    />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">İndirim & Kampanya Kuponları</label>
                        <span className="text-[9px] text-[var(--text-muted)]">Sepet tutarına özel indirim çıkarma becerisi</span>
                    </div>
                    <button
                        onClick={() => onChange('enableDiscounts' as any, !(options as any).enableDiscounts)}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${(options as any).enableDiscounts ? 'bg-lime-500' : 'bg-[var(--surface-elevated)]'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-[var(--bg-paper)] absolute top-1 transition-transform ${(options as any).enableDiscounts ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};
